export class NoteBookUpdateDTO {
  
    /**
     *
     * @param {String} title 
     * @param {String} banner 
     * @param {String} description 
     * @param {String} parent 
     */ 
    constructor(title = undefined,banner = undefined,description = undefined,parent = undefined){
        this.title = title
        this.banner = banner
        this.description = description
        this.parent = parent
    }
       
    /**
     * 
     * @type {String}
     */
    title=undefined   
    /**
     * 
     * @type {String}
     */
    banner=undefined   
    /**
     * 
     * @type {String}
     */
    description=undefined   
    /**
     * 
     * @type {String}
     */
    parent=undefined
    
}
export class StdResult {
  
    /**
     *
     * @param {String} message 
     * @param {Number} code 
     * @param {undefined} data 
     * @param {Array} errors 
     */ 
    constructor(message = undefined,code = undefined,data = undefined,errors = undefined){
        this.message = message
        this.code = code
        this.data = data
        this.errors = errors
    }
       
    /**
     * 
     * @type {String}
     */
    message=undefined   
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
export class NoteBookContentDTO {
  
    /**
     *
     * @param {String} content 
     * @param {String} versionId 
     */ 
    constructor(content = undefined,versionId = undefined){
        this.content = content
        this.versionId = versionId
    }
       
    /**
     * 
     * @type {String}
     */
    content=undefined   
    /**
     * 
     * @type {String}
     */
    versionId=undefined
    
}
export class NoteBookCreateDTO {
  
    /**
     *
     * @param {String} title 
     * @param {String} description 
     * @param {String} banner 
     * @param {String} parent 
     */ 
    constructor(title = undefined,description = undefined,banner = undefined,parent = undefined){
        this.title = title
        this.description = description
        this.banner = banner
        this.parent = parent
    }
       
    /**
     * 
     * @type {String}
     */
    title=undefined   
    /**
     * 
     * @type {String}
     */
    description=undefined   
    /**
     * 
     * @type {String}
     */
    banner=undefined   
    /**
     * 
     * @type {String}
     */
    parent=undefined
    
}
export class GroupCreateDTO {
  
    /**
     *
     * @param {String} name 
     * @param {String} emoji 图标
     * @param {String} parent 父节点
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
     * 图标
     * @type {String}
     */
    emoji=undefined   
    /**
     * 父节点
     * @type {String}
     */
    parent=undefined
    
}
export class ConfigCreateOrUpdateDTO {
  
    /**
     *
     * @param {String} configId 
     * @param {Array} dataPath 
     * @param {Number} dataIndex 
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
    constructor(configId = undefined,dataPath = undefined,dataIndex = undefined,language = undefined,autoSave = undefined,initStatus = undefined,name = undefined,lastLocalPath = undefined,editorExpandContent = undefined,activeSystemMode = undefined,dynamicEffect = undefined,watchAllExtensions = undefined,theme = undefined){
        this.configId = configId
        this.dataPath = dataPath
        this.dataIndex = dataIndex
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
     * @type {Array}
     */
    dataPath=undefined   
    /**
     * 
     * @type {Number}
     */
    dataIndex=undefined   
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
