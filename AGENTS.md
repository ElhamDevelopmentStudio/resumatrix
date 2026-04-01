<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Required task flow

For every task in this repository:

1. Follow the user's instructions exactly.
2. After completing the task, run basic validation to confirm the main behavior works. Focus on the major paths only — you do not need to test every small detail.
3. Review `README.md` and update it only if your changes make the current README inaccurate or incomplete. Otherwise, leave it unchanged.
4. Commit the finished work with an appropriate commit message that uses the required prefix or convention.

## Component placement rules

- If you are working on `/dashboard`, place components that are only used by that route in `app/(dashboard)/dashboard/_components`.
- If a component is reusable across routes, place it in `components`.
- Shared layout elements that will be reused across pages, such as the footer, must be implemented as reusable shared components instead of being duplicated inside route files.

## File naming rules

- Use kebab-case for every file name you create or rename.
- Do not use PascalCase, camelCase, or any other file-name casing.

<!-- END:nextjs-agent-rules -->
