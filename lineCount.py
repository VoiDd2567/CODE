import os

all_items = os.listdir("./")

forbidden_items = ["node_modules", "eslint.config.js", "package-lock.json","package.json",".gitignore","server.cert","server.key",
"temp","vite.config.js","README.md","pictures",".git"]

line_count = 0

def count_folder_lines(folder_path):
    global line_count
    entries = os.listdir(folder_path)
    for entry in entries:
        if entry in forbidden_items:
            continue 
        full_path = os.path.join(folder_path, entry)
        if os.path.isfile(full_path):
            try:
                print(full_path)
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    line_count += len(f.readlines())
            except Exception as e:
                print(f"Failed to read {full_path}: {e}")
        if os.path.isdir(full_path):
            count_folder_lines(full_path)


count_folder_lines("./")
print(line_count)