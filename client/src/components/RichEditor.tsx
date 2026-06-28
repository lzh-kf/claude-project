import { useState, useEffect } from 'react'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { message } from 'antd'

function getToken(): string | null {
  return localStorage.getItem('token')
}

interface Props {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  height?: number
}

export default function RichEditor({ value, onChange, placeholder = '请输入商品详情...', height = 450 }: Props) {
  const [editor, setEditor] = useState<IDomEditor | null>(null)

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {}

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    MENU_CONF: {
      uploadImage: {
        // 自定义上传到服务端
        async customUpload(file: File, insertFn: (url: string, alt: string, href: string) => void) {
          try {
            const formData = new FormData()
            formData.append('image', file)

            const token = getToken()
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            })
            const json = await res.json()

            if (json.code === 0) {
              insertFn(json.data.url, json.data.alt, json.data.href)
            } else {
              message.error(json.message || '图片上传失败')
            }
          } catch {
            message.error('图片上传失败，请检查网络')
          }
        },
      },
    },
  }

  // 组件销毁时销毁编辑器实例
  useEffect(() => {
    return () => {
      if (editor) editor.destroy()
    }
  }, [editor])

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #d9d9d9' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={value || ''}
        onCreated={setEditor}
        onChange={ed => onChange?.(ed.getHtml())}
        mode="default"
        style={{ height, overflowY: 'auto' }}
      />
    </div>
  )
}
