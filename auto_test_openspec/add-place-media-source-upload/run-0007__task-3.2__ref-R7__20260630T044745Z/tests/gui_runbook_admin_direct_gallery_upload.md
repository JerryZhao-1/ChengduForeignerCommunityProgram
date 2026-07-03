# MCP GUI Runbook: Admin Direct Gallery Upload

Use browser MCP only. Do not run executable browser automation scripts.

1. Open `http://127.0.0.1:5173/places`.
2. Click `新增地点` and verify the upload button is disabled before the place has an id.
3. Save the place as a draft, then reopen it for editing.
4. Click `选择并上传图片` and select a small JPEG/PNG fixture from the Supervisor machine.
5. Capture that an uploaded file id appears under `已上传文件`.
6. Add or keep an Amap external image and capture that external media appears under `外部来源图片`, separate from uploaded files.
7. Save media settings, reload, and capture that uploaded and external media remain separate.
