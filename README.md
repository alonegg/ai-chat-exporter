# AI Chat Exporter - Browser Extension

一个功能强大的浏览器插件，可以将与AI大语言模型的对话内容导出为Markdown和HTML文件，并自动保存到GitHub仓库。

## 核心功能特性

### 🌐 多平台支持
- **ChatGPT** (`chatgpt.com`, `chat.openai.com`)
  - 自动识别用户和助手消息
  - 保留代码块格式和语法高亮
  - 支持多轮对话完整导出
  
- **Claude** (`claude.ai`)
  - 提取完整对话历史
  - 保持消息结构和格式
  - 支持Claude的特殊格式内容
  
- **Gemini** (`gemini.google.com`)
  - 导出Google Gemini对话
  - 保留富文本格式
  - 支持图文混合内容识别
  
- **Poe** (`poe.com`)
  - 支持所有Poe平台的AI机器人
  - 自动识别不同bot的回复
  - 保持对话上下文完整性

### 📤 GitHub集成功能
- **直接上传**: 无需手动操作，一键上传到GitHub仓库
- **智能覆盖**: 自动检测同名文件，支持更新或创建新文件
- **分支选择**: 可指定上传到特定分支（默认main）
- **路径自定义**: 支持在仓库中创建文件夹结构组织对话
- **批量操作**: 同时上传Markdown和HTML两种格式

### 📝 导出格式特性

#### Markdown格式
- 清晰的对话结构，使用分隔线区分轮次
- 保留原始格式，包括：
  - 列表和编号
  - 代码块with语言标识
  - 链接和图片引用
  - 加粗、斜体等文本样式
- 添加元数据信息（时间戳、URL、平台）

#### HTML格式
- **专业设计的样式**:
  - 渐变色标题栏
  - 用户消息：蓝色边框卡片
  - AI回复：紫色边框卡片
  - 响应式设计，适配各种屏幕
- **代码高亮**: 黑色背景的代码展示区
- **可读性优化**: 精心调整的字体和间距
- **独立文件**: 所有样式内嵌，可直接打开查看

## 安装指南

### 开发版安装

1. **下载插件文件**
   ```bash
   git clone https://github.com/alonegg/ai-chat-exporter.git
   ```

2. **Chrome浏览器安装**
   - 打开Chrome，访问 `chrome://extensions/`
   - 右上角开启「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `ai-chat-exporter` 文件夹
   - 插件图标将出现在工具栏

3. **Edge浏览器安装**
   - 打开Edge，访问 `edge://extensions/`
   - 开启「开发人员模式」
   - 点击「加载解压的扩展」
   - 选择插件文件夹

## 配置步骤

### 步骤1: 创建GitHub Access Token

1. **访问GitHub Token设置**
   - 登录GitHub
   - 访问 [Personal Access Tokens](https://github.com/settings/tokens/new)

2. **配置Token权限**
   - **Token名称**: 例如 "AI Chat Exporter"
   - **过期时间**: 建议90天或更长
   - **权限选择**:
     - ✅ `repo` - 完整仓库访问（私有仓库需要）
     - ✅ `public_repo` - 公开仓库访问（仅公开仓库）

3. **生成并保存Token**
   - 点击 "Generate token"
   - ⚠️ **重要**: 立即复制token，页面关闭后无法再查看

### 步骤2: 配置插件

1. **打开设置页面**
   - 方法1: 点击插件图标 → 点击设置齿轮图标
   - 方法2: 右键插件图标 → 选择「选项」

2. **填写GitHub信息**
   - **Personal Access Token**: 粘贴刚才复制的token
   - **GitHub用户名**: 你的GitHub用户名或组织名
   - **仓库名称**: 目标仓库名（不含用户名）
   - **分支**: 默认`main`，可改为其他分支

3. **验证连接**
   - 点击「Test Connection」按钮
   - 成功提示：`Successfully connected to username/repo!`

4. **保存设置**
   - 点击「Save Settings」
   - 看到绿色成功提示即可

## 使用教程

### 基础导出流程

1. **打开对话页面**
   - 支持的网站：ChatGPT、Claude、Gemini、Poe
   - 确保对话内容已完整加载

2. **提取对话内容**
   - 点击浏览器工具栏的插件图标
   - 点击「Extract Conversation」按钮
   - 等待提取完成（1-3秒）

3. **预览和编辑**
   - 查看Markdown/HTML预览
   - 可自定义文件名（留空自动生成）
   - 选择导出格式（MD/HTML/两者）
   - 设置仓库内路径

4. **导出到GitHub**
   - 点击「Export to GitHub」
   - 等待上传完成
   - 成功后窗口自动关闭

## 技术特性

- 🔒 **安全**: Token加密存储，本地处理，无第三方依赖
- ⚡ **高效**: 智能提取，异步操作，缓存机制
- 🎯 **智能**: 自动命名，格式识别，错误恢复
- 🎨 **美观**: 现代UI设计，响应式布局

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issues 和 Pull Requests！

---

**Made with ❤️ for the AI community**