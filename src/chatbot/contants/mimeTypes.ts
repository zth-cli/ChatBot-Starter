/**
 * Mime types
 */
export enum MimeType {
  /**
   * JSON
   */
  JSON = 'application/json',

  /**
   * XML
   */
  XML = 'application/xml',

  /**
   * HTML
   */
  HTML = 'text/html',

  /**
   * Plain text
   */
  TXT = 'text/plain',
  /**
   * Binary
   */
  BINARY = 'application/octet-stream',

  /**
   * Video
   */
  VIDEO = 'video/mp4',

  /**
   * Audio
   */
  AUDIO = 'audio/mpeg',
  /**
   * Font
   */
  FONT = 'font/ttf',

  /**
   * CSS
   */
  CSS = 'text/css',

  /**
   * JavaScript
   */
  JS = 'text/javascript',

  /**
   * SVG
   */
  SVG = 'image/svg+xml',

  /**
   * PDF
   */
  PDF = 'application/pdf',

  /**
   * ZIP
   */
  ZIP = 'application/zip',

  /**
   * GZIP
   */
  GZIP = 'application/gzip',

  /**
   * TAR
   */
  TAR = 'application/x-tar',

  /**
   * TAR.GZ
   */
  TARGZ = 'application/x-gzip',
  /**
   * TAR.BZ2
   */
  TARBZ2 = 'application/x-bzip2',

  /**
   * TAR.XZ
   */
  TARXZ = 'application/x-xz',

  /**
   * TAR.ZSTD
   */
  TARZSTD = 'application/zstd',

  /**
   * TAR.LZMA
   */
  TARLZMA = 'application/x-lzma',

  /**
   * TAR.LZ
   */
  TARLZ = 'application/x-lzip',

  /**
   * TAR.LZ4
   */
  TARLZ4 = 'application/x-lz4',

  /**
   * DOC
   */
  DOC = 'application/msword',

  /**
   * DOCX
   */
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  /**
   * XLS
   */
  XLS = 'application/vnd.ms-excel',

  /**
   * XLSX
   */
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  /**
   * PPT
   */
  PPT = 'application/vnd.ms-powerpoint',

  /**
   * PPTX
   */
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  /**
   * MARKDOWN
   */
  MARKDOWN = 'text/markdown',

  /**
   * YAML
   */
  YAML = 'text/yaml',

  /**
   * TOML
   */
  TOML = 'text/toml',

  /**
   * CSV
   */
  CSV = 'text/csv',

  /**
   * JSON-LD
   */
  JSONLD = 'application/ld+json',

  /**
   * JPEG
   */
  JPEG = 'image/jpeg',

  /**
   * PNG
   */
  PNG = 'image/png',

  /**
   * GIF
   */
  GIF = 'image/gif',

  /**
   * WEBP
   */
  WEBP = 'image/webp',

  /**
   * AVIF
   */
  AVIF = 'image/avif',

  /**
   * HEIC
   */
  HEIC = 'image/heic',
}

export const ImageMimeTypes = [MimeType.JPEG, MimeType.PNG, MimeType.GIF, MimeType.WEBP, MimeType.AVIF, MimeType.HEIC]
export const VideoMimeTypes = [MimeType.VIDEO]
export const AudioMimeTypes = [MimeType.AUDIO]

/**
 * @description 创建枚举， 根据二进制文件头（Magic Number)获取文件类型
 */
export enum FileType {
  /**
   * JPEG
   */
  JPEG = 'FFD8FF',

  /**
   * PNG
   */
  PNG = '89504E47',

  /**
   * GIF
   */
  GIF = '47494638',

  /**
   * WEBP
   */
  WEBP = '52494646',

  /**
   * MP4
   */
  MP4 = '00000020',
  /**
   * JSON
   */
  JSON = '7B7D',
  /**
   * XML
   */
  XML = '3C3F786D6C',
  /**
   * HTML
   */
  HTML = '3C68746D6C',
  /**
   * ZIP
   */
  ZIP = '504B0304',
  /**
   * GZIP
   */
  GZIP = '1F8B08',
  /**
   * TAR
   */
  TAR = '7573746172',

  /**
   * TAR.BZ2
   * @description 压缩文件
   */
  TARBZ2 = '425A68',
  /**
   * YAML
   */
  YAML = '2D2D2F2A',
  /**
   * TOML
   */
  TOML = '2D2D2D2D',
  /**
   * CSV
   */
  CSV = '2C0A0D0A',
  /**
   * JSON-LD
   */
  JSONLD = '7B7D5C3A',
  /**
   * SVG
   */
  SVG = '3C3F786D6C2076657273696F6E3D22312E302220656E636F64696E673D225554462D38223F3E',
  /**
   * PDF
   */
  PDF = '255044462D312E',
}
