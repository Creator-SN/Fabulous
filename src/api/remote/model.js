export class DataTemplateUpdateDTO {
  
    /**
     *
     * @param {String} id 
     * @param {String} name 
     * @param {String} emoji 
     */ 
    constructor(id = undefined,name = undefined,emoji = undefined){
        this.id = id
        this.name = name
        this.emoji = emoji
    }
       
    /**
     * 
     * @type {String}
     */
    id=undefined   
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined
    
}
export class StdResult {
  
    /**
     *
     * @param {String} status 
     * @param {Number} code 
     * @param {undefined} data 
     * @param {Array} errors 
     * @param {String} message 
     */ 
    constructor(status = undefined,code = undefined,data = undefined,errors = undefined,message = undefined){
        this.status = status
        this.code = code
        this.data = data
        this.errors = errors
        this.message = message
    }
       
    /**
     * 
     * @type {String}
     */
    status=undefined   
    /**
     * 
     * @type {Number}
     */
    code=undefined   
    /**
     * 
     * @type {undefined}
     */
    data=undefined   
    /**
     * 
     * @type {Array}
     */
    errors=undefined   
    /**
     * 
     * @type {String}
     */
    message=undefined
    
}
export class DataItemUpdateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 
     * @param {String} id 
     * @param {String} pdfId 
     * @param {Array} labels 
     */ 
    constructor(name = undefined,emoji = undefined,id = undefined,pdfId = undefined,labels = undefined){
        this.name = name
        this.emoji = emoji
        this.id = id
        this.pdfId = pdfId
        this.labels = labels
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined   
    /**
     * 
     * @type {String}
     */
    id=undefined   
    /**
     * 
     * @type {String}
     */
    pdfId=undefined   
    /**
     * 
     * @type {Array}
     */
    labels=undefined
    
}
export class ItemLabel {
  
    /**
     *
     * @param {String} text 
     * @param {String} background 
     */ 
    constructor(text = undefined,background = undefined){
        this.text = text
        this.background = background
    }
       
    /**
     * 
     * @type {String}
     */
    text=undefined   
    /**
     * 
     * @type {String}
     */
    background=undefined
    
}
export class DataPageUpdateDTO {
  
    /**
     *
     * @param {String} id 
     * @param {String} name 
     * @param {String} emoji 
     * @param {String} parent 
     */ 
    constructor(id = undefined,name = undefined,emoji = undefined,parent = undefined){
        this.id = id
        this.name = name
        this.emoji = emoji
        this.parent = parent
    }
       
    /**
     * 
     * @type {String}
     */
    id=undefined   
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined   
    /**
     * 
     * @type {String}
     */
    parent=undefined
    
}
export class MetadataUpdateDTO {
  
    /**
     *
     * @param {String} id 
     * @param {String} publisher 
     * @param {String} DOI 
     * @param {Number} year 
     * @param {String} createDate 
     * @param {String} source 
     * @param {String} title 
     * @param {String} url 
     * @param {String} containerTitle 
     * @param {String} ISSN 
     * @param {String} language 
     * @param {String} chapter 
     * @param {String} pages 
     * @param {String} school 
     * @param {String} note 
     * @param {String} doi 
     * @param {String} issn 
     * @param {String} abstract 
     */ 
    constructor(id = undefined,publisher = undefined,DOI = undefined,year = undefined,createDate = undefined,source = undefined,title = undefined,url = undefined,containerTitle = undefined,ISSN = undefined,language = undefined,chapter = undefined,pages = undefined,school = undefined,note = undefined,doi = undefined,issn = undefined,abstract = undefined){
        this.id = id
        this.publisher = publisher
        this.DOI = DOI
        this.year = year
        this.createDate = createDate
        this.source = source
        this.title = title
        this.url = url
        this.containerTitle = containerTitle
        this.ISSN = ISSN
        this.language = language
        this.chapter = chapter
        this.pages = pages
        this.school = school
        this.note = note
        this.doi = doi
        this.issn = issn
        this.abstract = abstract
    }
       
    /**
     * 
     * @type {String}
     */
    id=undefined   
    /**
     * 
     * @type {String}
     */
    publisher=undefined   
    /**
     * 
     * @type {String}
     */
    DOI=undefined   
    /**
     * 
     * @type {Number}
     */
    year=undefined   
    /**
     * 
     * @type {String}
     */
    createDate=undefined   
    /**
     * 
     * @type {String}
     */
    source=undefined   
    /**
     * 
     * @type {String}
     */
    title=undefined   
    /**
     * 
     * @type {String}
     */
    url=undefined   
    /**
     * 
     * @type {String}
     */
    containerTitle=undefined   
    /**
     * 
     * @type {String}
     */
    ISSN=undefined   
    /**
     * 
     * @type {String}
     */
    language=undefined   
    /**
     * 
     * @type {String}
     */
    chapter=undefined   
    /**
     * 
     * @type {String}
     */
    pages=undefined   
    /**
     * 
     * @type {String}
     */
    school=undefined   
    /**
     * 
     * @type {String}
     */
    note=undefined   
    /**
     * 
     * @type {String}
     */
    doi=undefined   
    /**
     * 
     * @type {String}
     */
    issn=undefined   
    /**
     * 
     * @type {String}
     */
    abstract=undefined
    
}
export class GroupUpdateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 
     * @param {String} parent 
     */ 
    constructor(name = undefined,emoji = undefined,parent = undefined){
        this.name = name
        this.emoji = emoji
        this.parent = parent
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined   
    /**
     * 
     * @type {String}
     */
    parent=undefined
    
}
export class PartitionUpdateDTO {
  
    /**
     *
     * @param {String} id 
     * @param {String} name 
     * @param {String} emoji 
     */ 
    constructor(id = undefined,name = undefined,emoji = undefined){
        this.id = id
        this.name = name
        this.emoji = emoji
    }
       
    /**
     * 
     * @type {String}
     */
    id=undefined   
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined
    
}
export class DataSourceUpdateDTO {
  
    /**
     *
     * @param {String} name 
     */ 
    constructor(name = undefined){
        this.name = name
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined
    
}
export class UserRegister {
  
    /**
     *
     * @param {String} name 姓名
     * @param {String} password 密码
     * @param {String} email 邮箱
     * @param {String} phone 手机号码
     * @param {String} nickname 昵称
     */ 
    constructor(name = undefined,password = undefined,email = undefined,phone = undefined,nickname = undefined){
        this.name = name
        this.password = password
        this.email = email
        this.phone = phone
        this.nickname = nickname
    }
       
    /**
     * 姓名
     * @type {String}
     */
    name=undefined   
    /**
     * 密码
     * @type {String}
     */
    password=undefined   
    /**
     * 邮箱
     * @type {String}
     */
    email=undefined   
    /**
     * 手机号码
     * @type {String}
     */
    phone=undefined   
    /**
     * 昵称
     * @type {String}
     */
    nickname=undefined
    
}
export class UserUpdatePassword {
  
    /**
     *
     * @param {String} password 用户的密码
     * @param {String} code 用户的验证码
     */ 
    constructor(password = undefined,code = undefined){
        this.password = password
        this.code = code
    }
       
    /**
     * 用户的密码
     * @type {String}
     */
    password=undefined   
    /**
     * 用户的验证码
     * @type {String}
     */
    code=undefined
    
}
export class UserLogin {
  
    /**
     *
     * @param {String} id 用户的Id
     * @param {String} password 用户的密码
     * @param {String} code 验证码
     */ 
    constructor(id = undefined,password = undefined,code = undefined){
        this.id = id
        this.password = password
        this.code = code
    }
       
    /**
     * 用户的Id
     * @type {String}
     */
    id=undefined   
    /**
     * 用户的密码
     * @type {String}
     */
    password=undefined   
    /**
     * 验证码
     * @type {String}
     */
    code=undefined
    
}
export class RoleRequest {
  
    /**
     *
     * @param {String} name 名称
     * @param {String} description 描述
     */ 
    constructor(name = undefined,description = undefined){
        this.name = name
        this.description = description
    }
       
    /**
     * 名称
     * @type {String}
     */
    name=undefined   
    /**
     * 描述
     * @type {String}
     */
    description=undefined
    
}
export class UserUpdate {
  
    /**
     *
     * @param {String} name 用户的真实名字
     * @param {String} nickname 用户的昵称
     * @param {String} birth 用户出生的时间
     * @param {String} gender 用户的性别MALE/FEMALE
     * @param {String} email 用户的邮箱
     * @param {String} phone 手机号码
     */ 
    constructor(name = undefined,nickname = undefined,birth = undefined,gender = undefined,email = undefined,phone = undefined){
        this.name = name
        this.nickname = nickname
        this.birth = birth
        this.gender = gender
        this.email = email
        this.phone = phone
    }
       
    /**
     * 用户的真实名字
     * @type {String}
     */
    name=undefined   
    /**
     * 用户的昵称
     * @type {String}
     */
    nickname=undefined   
    /**
     * 用户出生的时间
     * @type {String}
     */
    birth=undefined   
    /**
     * 用户的性别MALE/FEMALE
     * @type {String}
     */
    gender=undefined   
    /**
     * 用户的邮箱
     * @type {String}
     */
    email=undefined   
    /**
     * 手机号码
     * @type {String}
     */
    phone=undefined
    
}
export class UpdateAvatarRequest {
  
    /**
     *
     * @param {String} avatar 头像
     */ 
    constructor(avatar = undefined){
        this.avatar = avatar
    }
       
    /**
     * 头像
     * @type {String}
     */
    avatar=undefined
    
}
export class EmailRequest {
  
    /**
     *
     * @param {String} username 用户名
     * @param {String} password 密码
     * @param {String} smtphost 邮箱的smtp地址
     * @param {Number} smtpport SMTP端口
     * @param {String} imaphost imap地址
     * @param {Number} imapport imap端口
     * @param {undefined} smtpssl 是否启用smtp的ssl加密
     * @param {undefined} imapssl 是否启用imap的ssl加密
     */ 
    constructor(username = undefined,password = undefined,smtphost = undefined,smtpport = undefined,imaphost = undefined,imapport = undefined,smtpssl = undefined,imapssl = undefined){
        this.username = username
        this.password = password
        this.smtphost = smtphost
        this.smtpport = smtpport
        this.imaphost = imaphost
        this.imapport = imapport
        this.smtpssl = smtpssl
        this.imapssl = imapssl
    }
       
    /**
     * 用户名
     * @type {String}
     */
    username=undefined   
    /**
     * 密码
     * @type {String}
     */
    password=undefined   
    /**
     * 邮箱的smtp地址
     * @type {String}
     */
    smtphost=undefined   
    /**
     * SMTP端口
     * @type {Number}
     */
    smtpport=undefined   
    /**
     * imap地址
     * @type {String}
     */
    imaphost=undefined   
    /**
     * imap端口
     * @type {Number}
     */
    imapport=undefined   
    /**
     * 是否启用smtp的ssl加密
     * @type {undefined}
     */
    smtpssl=undefined   
    /**
     * 是否启用imap的ssl加密
     * @type {undefined}
     */
    imapssl=undefined
    
}
export class AddEmailTemplateModel {
  
    /**
     *
     * @param {String} name 模版名称
     * @param {String} subject 模版主题
     * @param {String} content 模版内容
     * @param {undefined} variables 模版变量
     */ 
    constructor(name = undefined,subject = undefined,content = undefined,variables = undefined){
        this.name = name
        this.subject = subject
        this.content = content
        this.variables = variables
    }
       
    /**
     * 模版名称
     * @type {String}
     */
    name=undefined   
    /**
     * 模版主题
     * @type {String}
     */
    subject=undefined   
    /**
     * 模版内容
     * @type {String}
     */
    content=undefined   
    /**
     * 模版变量
     * @type {undefined}
     */
    variables=undefined
    
}
export class UpdateEmailTemplateModel {
  
    /**
     *
     * @param {String} name 模版名称
     * @param {String} subject 模版主题
     * @param {String} content 模版内容
     * @param {undefined} variables 模版变量
     */ 
    constructor(name = undefined,subject = undefined,content = undefined,variables = undefined){
        this.name = name
        this.subject = subject
        this.content = content
        this.variables = variables
    }
       
    /**
     * 模版名称
     * @type {String}
     */
    name=undefined   
    /**
     * 模版主题
     * @type {String}
     */
    subject=undefined   
    /**
     * 模版内容
     * @type {String}
     */
    content=undefined   
    /**
     * 模版变量
     * @type {undefined}
     */
    variables=undefined
    
}
export class AddWebsiteConfigDTO {
  
    /**
     *
     * @param {String} name 网站配置名称
     * @param {String} value 网站配置值
     * @param {String} permission 网站配置可视权限
     */ 
    constructor(name = undefined,value = undefined,permission = undefined){
        this.name = name
        this.value = value
        this.permission = permission
    }
       
    /**
     * 网站配置名称
     * @type {String}
     */
    name=undefined   
    /**
     * 网站配置值
     * @type {String}
     */
    value=undefined   
    /**
     * 网站配置可视权限
     * @type {String}
     */
    permission=undefined
    
}
export class DataTemplateCreateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 
     */ 
    constructor(name = undefined,emoji = undefined){
        this.name = name
        this.emoji = emoji
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined
    
}
export class DataItemCreateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 
     * @param {Array} labels 
     */ 
    constructor(name = undefined,emoji = undefined,labels = undefined){
        this.name = name
        this.emoji = emoji
        this.labels = labels
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined   
    /**
     * 
     * @type {Array}
     */
    labels=undefined
    
}
export class DataPageCreateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 
     * @param {String} content 
     */ 
    constructor(name = undefined,emoji = undefined,content = undefined){
        this.name = name
        this.emoji = emoji
        this.content = content
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined   
    /**
     * 
     * @type {String}
     */
    content=undefined
    
}
export class GroupCreateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 图标
     */ 
    constructor(name = undefined,emoji = undefined){
        this.name = name
        this.emoji = emoji
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 图标
     * @type {String}
     */
    emoji=undefined
    
}
export class PartitionCreateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 
     */ 
    constructor(name = undefined,emoji = undefined){
        this.name = name
        this.emoji = emoji
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    emoji=undefined
    
}
export class ConfigCreateOrUpdateDTO {
  
    /**
     *
     * @param {String} configId 
     * @param {String} data_index 
     * @param {String} language 
     * @param {undefined} autoSave 
     * @param {undefined} initStatus 
     * @param {String} name 
     * @param {String} lastLocalPath 
     * @param {undefined} editorExpandContent 
     * @param {String} activeSystemMode 
     * @param {undefined} dynamicEffect 
     * @param {undefined} watchAllExtensions 
     * @param {String} theme 
     */ 
    constructor(configId = undefined,data_index = undefined,language = undefined,autoSave = undefined,initStatus = undefined,name = undefined,lastLocalPath = undefined,editorExpandContent = undefined,activeSystemMode = undefined,dynamicEffect = undefined,watchAllExtensions = undefined,theme = undefined){
        this.configId = configId
        this.data_index = data_index
        this.language = language
        this.autoSave = autoSave
        this.initStatus = initStatus
        this.name = name
        this.lastLocalPath = lastLocalPath
        this.editorExpandContent = editorExpandContent
        this.activeSystemMode = activeSystemMode
        this.dynamicEffect = dynamicEffect
        this.watchAllExtensions = watchAllExtensions
        this.theme = theme
    }
       
    /**
     * 
     * @type {String}
     */
    configId=undefined   
    /**
     * 
     * @type {String}
     */
    data_index=undefined   
    /**
     * 
     * @type {String}
     */
    language=undefined   
    /**
     * 
     * @type {undefined}
     */
    autoSave=undefined   
    /**
     * 
     * @type {undefined}
     */
    initStatus=undefined   
    /**
     * 
     * @type {String}
     */
    name=undefined   
    /**
     * 
     * @type {String}
     */
    lastLocalPath=undefined   
    /**
     * 
     * @type {undefined}
     */
    editorExpandContent=undefined   
    /**
     * 
     * @type {String}
     */
    activeSystemMode=undefined   
    /**
     * 
     * @type {undefined}
     */
    dynamicEffect=undefined   
    /**
     * 
     * @type {undefined}
     */
    watchAllExtensions=undefined   
    /**
     * 
     * @type {String}
     */
    theme=undefined
    
}
export class DataSourceCreateDTO {
  
    /**
     *
     * @param {String} name 
     */ 
    constructor(name = undefined){
        this.name = name
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined
    
}
export class SseEmitter {
  
    /**
     *
     * @param {Number} timeout 
     */ 
    constructor(timeout = undefined){
        this.timeout = timeout
    }
       
    /**
     * 
     * @type {Number}
     */
    timeout=undefined
    
}
