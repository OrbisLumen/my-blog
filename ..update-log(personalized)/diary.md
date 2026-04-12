# Diary Markdown 更改日志

## 目标
将 diary 从手写 TypeScript 数据改为 Markdown 内容驱动，支持在 `src/content/diary/` 下长期维护日记与图片。

## 本次改动
### 新增文件
- `src/types/diary.ts`
- `src/utils/diary-content.ts`
- `src/content/diary/**`

### 修改文件
- `src/content.config.ts`
- `src/pages/diary.astro`
- `src/components/features/diary/MomentCard.astro`

## 当前结构
```text
src/content/diary/
  2026/
    1/
      diary.md
      sakura.jpg
      1.webp
    2/
      diary.md
```

## 数据流

```
src/content/diary/**/*.md
  ↓
src/utils/diary-content.ts
  ↓
src/pages/diary.astro
  ↓
src/components/features/diary/MomentCard.astro
```

## diary字段

每篇 diary 使用 frontmatter 保存以下字段：

```
id: number;
content: string;
date: string;
images?: string[];
location?: string;
mood?: string;
tags?: string[];
```

## diary示例

```markdown
---
id: 1
content: "Finally finishing my first blog"
date: "2026-04-11T17:21:00Z"
images:
  - ./sakura.jpg
  - ./1.webp
location: "Chengdu, Sichuan"
mood: "Excited"
tags:
  - Blog
  - OrbisLumen
  - FE
---
```

## 规则说明

- src/content/diary/ 下可自由创建子文件夹
- 文件名和文件夹名可自由命名
- 图片可与当前 diary 放在同一目录
- images 使用相对当前 md 文件的路径
- diary 页面按 date 倒序排序
- id 仅用于唯一标识，不参与排序

## 维护原则

- 少改原模板文件，多新增独立文件
- 不将 diary 并入 post 主系统
- 不修改文章分页、详情路由等高风险文件
- 保持后续同步 upstream 时的冲突范围尽量小

## 当前结果

已完成从 src/data/diary.ts 到 src/content/diary/**/*.md 的迁移，diary 页面可继续保留原有展示方式，同时改为 Markdown 长期维护。
