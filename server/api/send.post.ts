// server/api/send.post.ts
import { Resend } from "resend";
import { ErrorCode, createApiError, logApiError } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import type { ApiErrorDetail } from "~~/types/api";
import { formatApiResponse } from "../utils/responseFormatter";

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  // リクエストIDをコンテキストから取得
  const requestId = event.context.requestId || "unknown";

  try {
    const body = await readBody(event);
    const { type, name, email, subject, message } = body;

    logger.debug(
      "Contact form submission",
      {
        requestId,
        path: event.path,
        method: event.method,
        query: getQuery(event),
      },
      {
        type,
        email,
      }
    );

    // 必須フィールドのバリデーション用配列
    const validationErrors: ApiErrorDetail[] = [];
    if (!name)
      validationErrors.push({
        field: "name",
        issue: "お名前を入力してください",
      });
    if (!email)
      validationErrors.push({
        field: "email",
        issue: "メールアドレスを入力してください",
      });
    if (!subject)
      validationErrors.push({
        field: "subject",
        issue: "件名を入力してください",
      });
    if (!message)
      validationErrors.push({
        field: "message",
        issue: "メッセージを入力してください",
      });

    // バリデーションエラーがある場合
    if (validationErrors.length > 0) {
      throw createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "必須フィールドが不足しています",
        validationErrors,
        requestId
      );
    }

    // メール送信前のログ
    logger.info("Sending email", {
      requestId,
      path: event.path,
      method: event.method,
      query: getQuery(event),
    });

    const htmlContent = `
    <html>
      <body>
        <p>問い合わせ種別: ${type || "指定なし"}</p>
        <p>名前: ${name}</p>
        <p>メールアドレス: ${email}</p>
        <p>件名: ${subject}</p>
        <p>メッセージ:</p>
        <p>${message}</p>
      </body>
    </html>
    `.trim();

    try {
      const data = await resend.emails.send({
        from: "test@resend.dev",
        to: "shinichi.hirai@gmail.com",
        subject,
        html: htmlContent,
      });

      logger.info(
        "Email sent successfully",
        {
          requestId,
          path: event.path,
          method: event.method,
          query: getQuery(event),
        },
        {
          // dataオブジェクトを安全に記録
          emailSent: true,
          emailData: typeof data === "object" ? data : null,
        }
      );

      return formatApiResponse(
        {
          success: true,
          // data.id が存在する場合のみ使用
          emailId:
            data && typeof data === "object" && "id" in data
              ? data.id
              : "unknown",
        },
        requestId
      );
    } catch (emailError) {
      // メール送信エラー処理
      logger.error(
        "Email sending failed",
        {
          requestId,
          path: event.path,
          method: event.method,
          query: getQuery(event),
        },
        {
          error:
            emailError instanceof Error
              ? emailError.message
              : String(emailError),
        }
      );

      throw createApiError(
        500,
        ErrorCode.SERVICE_UNAVAILABLE,
        "メール送信に失敗しました",
        [
          {
            issue:
              "メールサービスに接続できません。しばらくしてからもう一度お試しください。",
          },
        ],
        requestId
      );
    }
  } catch (error: unknown) {
    // エラーログの記録
    logApiError(error, {
      requestId,
      path: event.path,
      method: event.method,
      query: getQuery(event),
    });

    // APIエラーの場合はそのまま返す
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    // その他の予期しないエラー
    logger.error(
      "Unexpected error in contact form",
      {
        requestId,
        path: event.path,
        method: event.method,
        query: getQuery(event),
      },
      { error: error instanceof Error ? error.message : String(error) }
    );

    throw createApiError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "内部エラーが発生しました",
      undefined,
      requestId
    );
  }
});
