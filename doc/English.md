<div align="center">
    <img src="../src/renderer/src/assets/logo.png" width="180" />
    <p>Fabulous</p>
    <p>A cross-platform desktop workspace for reading, writing, and organizing research notes.</p>
</div>

<p align="center">
    <img src="https://img.shields.io/github/v/release/Creator-SN/Fabulous?style=flat-square" />
    <img src="https://img.shields.io/github/downloads/Creator-SN/Fabulous/total?color=green&style=flat-square" />
</p>

# Fabulous Desktop

Fabulous Desktop is the local Electron edition of the Fabulous ecosystem.

It combines local notebook editing, research material organization, file-based workflows, and desktop-native interactions in one place.

## Documents

- [中文说明](./Chinese.md)
- [Developer Guide](./README.dev.md)

## What can Fabulous do?

Fabulous provides:

- local notebook editing with `.fbn`, Markdown, HTML, and JSON support
- quick WYSIWYG note writing
- local folder browsing and file management
- PDF-centered reading and literature workflows
- desktop file association so `.fbn` files can be opened directly from the system

## Platform

- Windows 10 / 11
- macOS

## Quick Start

**Install**

Download the latest release from:

- <https://github.com/Creator-SN/Fabulous/releases>

**First Launch**

After opening the app for the first time, you can start directly from the local notebook area.

If you also need the wider literature-management workflow, Fabulous can continue to serve as a richer desktop workspace beyond note editing alone.

![Preview 1](./assets/f1.png)


## Introduction
Fabulous (FAB) is an app that combines research literature management with quick note-taking. It helps you organize academic materials quickly (PDF parsing, BibTeX retrieval, tagging, note-taking, and more) and lets you easily write well-formatted technical documents.
Let us look at how to get started with FAB:Getting Started with Notebooks
### 1. Add a Data Source
+ If you have just signed up and have not created any data source yet, first go to **Settings**, then click **Add Data Source** to create your own data source.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__5255F690-B0E7-4349-BB03-C559BEC63A62.png)

+ You can also join data sources created by others, in one of two ways:
  - A. **Enter an invitation code** to join
  - B. Have the other party **add your account** so that you can join afterwards
---

### 2. Managing Notebooks
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__FE48BDC5-C21B-49E6-B973-85233F58AA4A.png)

Notebooks are managed just like folders and files on a PC, with very clear logic: you can add any number of directories and notes under a data source.
---

### 3. Permission Management
1. Data sources support permission management: you can create **permission groups **to manage user permissions in bulk. If you want to invite users to your own data source, you must create at least one permission group.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__A7425425-8093-4F99-A5BD-59AE41509660.png)

In addition, users in a permission group can be set as **regular members** or **administrators**; administrators can invite other members to join within this permission group.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__74061E3D-60CA-4A28-BD07-A257387735B6.png)

2. A permission group has four permission types: **read, write, delete, and permission management**. These permissions refer to data source permissions, that is, global permissions: all paper projects and notes in the research module follow the global permissions and cannot be tuned at a finer granularity, whereas notebooks can be controlled precisely by directory and note. Among them, **permission management** means that users in this group can modify permissions for the directories and notes under the notebook.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__A23E819B-EC83-4EAC-9C66-54DC64558B19.png)

3. Permissions for directories and notes can be managed by selecting **Permissions** on the right side of the navigation bar:
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__3AA3FDA9-BDC0-4092-BB5A-DE204AA3033F.png)


In FAB, permissions are inherited in a chain: in “A→B→C”, you must first have permission for A and B in order to obtain permission for C, so every directory and note has the same four permission types as the data source.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__8D9E468E-DD08-4514-B437-D66B01845DEE.png)

Generally, to let the relevant users operate on subdirectories and notes, the parent directories must also be granted the corresponding permissions, which may allow them to directly perform a **delete** on the parent directory — a dangerous operation. To prevent this, you can check **“Protected directory”** for the parent directories to be protected, which prevents deletion. In addition, only users with the **permission management** permission can enable or disable the **“Protected directory”** permission.
4. Favorites and Sharing
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__5E9CAEC9-AB1D-443C-9C04-E6C7A7D2C2BC.png)

Above a note you have created, the two buttons in the red box are **Favorite** and **Share**. Favorited notes can be viewed in the **Collections and Sharing** favorites, and a single note can be favorited into multiple folders.

Shared notes fall into two categories: **data source member** sharing and **public** sharing:
![分享类型](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__7B4F9C9C-E472-4291-A190-838FF1E47ECF.png)

+ **Data source members: **all members of the data source that contains the note can **view**/**edit** the note.
+ **Public: **any internet user can **view** the note, and any logged-in user can **edit** the note.
> Special note: if you share several notes in the same directory, you can view the collection for that directory in the drop-down menu at the top left of the editor. Keep in mind that the directory containing a shared note also becomes publicly visible.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__489A468B-9DAC-404E-AC35-7E7C77A6FB04.png)
Getting Started with Research
### 1. Switching to the Research Section
![导航栏可以切换模式](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__E8E0D4E4-0129-4AAD-926A-8C179B958008.png)

1. First, at the top left you can see the **Research** section; click it to switch the navigation bar to research mode.
2. In research mode, you can add two kinds of structures: **groups** and **sections**. A group is a nested, stackable structure that you can think of as a **folder** that can contain multiple sections, whereas a section is a collection of paper projects. Following the definitions in the figure above, you can treat a group as the broad grouping for a topic or research field and a section as the technical route for a specific sub-direction (such as CNN, RNN, or Diffusion).
---

### 2. Importing Paper PDFs
![直接拖入PDF文件](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__F07228AE-4935-4C90-95CB-328AC744878C.png)

1. There are two ways to import a paper. One is to **drag a PDF file in**, and FAB will parse it and generate the metadata automatically.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__99CEC3C9-B0F5-4FE2-9524-B6D10074B7BF.png)

![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__A58CEC46-C99D-4625-A918-2C92279264CC.png)
As you can see, once parsing is complete, a **“project” appears.**Note that a project here is not just a PDF: it contains the PDF, metadata, several notes, tags, and other information. The green number in the figure represents the year, and the paper title has also been parsed automatically.
The other way is to click **Add** on the toolbar to create a project manually, then right-click that project and change its PDF file to add the paper; this method is fairly cumbersome, so use it only as a fallback.
2. Because PDF parsing can be unreliable, if the parsed title looks strange or information such as the year is not found, you can **manually edit the title and search**:
![展开项目并点击Metadata](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__C947D23D-297E-4266-B8A8-37EE7990B736.png)

![修改标题，点击刷新然后双击心仪的检索结果更新元数据，最后确定](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__6EAED44F-76FB-43BA-95A2-7D03B739FC93.png)
If **DBLP** data is retrieved during the search, the BibTeX information is obtained automatically as well; then simply click the orange **B** button on the project to copy the BibTeX.
---

### 3. Adding Notes
Once the paper information is organized, you can click **“Add Note”** in the project to start recording your thoughts on the paper:
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__C947D23D-297E-4266-B8A8-37EE7990B736.png)

1. Select the template preset you need to finish creating the note.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__8CB594AF-E5DB-429E-88AA-2889755274E7.png)

2. After entering the note, you can **add a header image**, **edit the title**, or click the **PDF** button at the top left to enter **two-column reading mode**.
![](/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__359E618D-34F8-40D3-9A29-E61475419C25.png)
One impressive feature of FAB is its support for **quick linking between PDF highlights and notes**, which helps you better recall the original passage behind a note.
![](https://fb.creatorsn.com/api/sources/image/1BF00510-E3CD-4E23-BB16-8E5C78A02D0E__2E9AB1F8-3D3A-4A9D-8CA8-6F69110EFC5B.png)

## Desktop Features

Compared with the pure web frontend, the desktop edition additionally supports:

- local file and folder access
- desktop title bar and window controls
- single-instance behavior
- `.fbn` file association
- automatic update integration

## License

GPL 3 License
