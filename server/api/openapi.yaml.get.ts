import { defineEventHandler, setHeader } from 'h3'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // YAMLファイルを読み込み
    const yamlPath = resolve(process.cwd(), 'api-spec.yaml')
    const yamlContent = await readFile(yamlPath, 'utf-8')
    
    // YAML形式のレスポンスヘッダーを設定
    setHeader(event, 'Content-Type', 'application/x-yaml')
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    
    return yamlContent
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAPI specification not found'
    })
  }
})