# %%
import os
import shutil

result = {}
prefix = '../'
target_dir = 'C:/Users/Alever/source/repos/FunBook/src/'

filter_filenames = ['background.js', 'web_transfer.py', 'translator.py']

fileData = os.walk(prefix)
for root, dirs, files in fileData:
    for file in files:
        if file in filter_filenames:
            continue
        # 复制到目标文件夹
        file = os.path.join(root, file)
        target_file = file.replace(prefix, target_dir)
        target_dirname = os.path.dirname(target_file)
        if not os.path.exists(target_dirname):
            os.makedirs(target_dirname)
        shutil.copyfile(file, target_file)


# %%
