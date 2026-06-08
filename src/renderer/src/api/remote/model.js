export class AIAPICreateRequest {
  
    /**
     *
     * @param {String} name 
     * @param {String} provider 
     * @param {String} api_key 
     * @param {String} base_url 
     */ 
    constructor(name = undefined,description = undefined,mode = undefined,provider = undefined,api_key = undefined,base_url = undefined){
        this.name = name
        this.description = description
        this.mode = mode
        this.provider = provider
        this.api_key = api_key
        this.base_url = base_url
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
    provider=undefined   
    /**
     * 
     * @type {String}
     */
    api_key=undefined   
    /**
     * 
     * @type {String}
     */
    base_url=undefined
    
}
export class AIAPIUpdateRequest {
  
    /**
     *

     */ 
    constructor(name = undefined,description = undefined,mode = undefined,provider = undefined,api_key = undefined,base_url = undefined){
        this.name = name
        this.description = description
        this.mode = mode
        this.provider = provider
        this.api_key = api_key
        this.base_url = base_url
    }
    
    
}
export class Base64ImageRequest {
  
    /**
     *
     * @param {String} base64 
     */ 
    constructor(base64 = undefined){
        this.base64 = base64
    }
       
    /**
     * 
     * @type {String}
     */
    base64=undefined
    
}
export class Body_updateItemPDF {
  
    /**
     *

     */ 
    constructor(formfileupload = undefined,file = undefined,pdf = undefined,upload = undefined,pdfId = undefined){
        this.formfileupload = formfileupload
        this.file = file
        this.pdf = pdf
        this.upload = upload
        this.pdfId = pdfId
    }
    
    
}
export class Body_uploadBinaryImage {
  
    /**
     *
     * @param {String} file 
     */ 
    constructor(file = undefined){
        this.file = file
    }
       
    /**
     * 
     * @type {String}
     */
    file=undefined
    
}
export class ConfigCreateOrUpdateRequest {
  
    /**
     *
     * @param {String} language 
     */ 
    constructor(configId = undefined,data_index = undefined,language = undefined,autoSave = undefined,init_status = undefined,name = undefined,lastLocalPath = undefined,editorExpandContent = undefined,activeSystemMode = undefined,dynamicEffect = undefined,watchAllExtensions = undefined,theme = undefined,readonly = undefined,aiOption = undefined,data_path = undefined,userId = undefined){
        this.configId = configId
        this.data_index = data_index
        this.language = language
        this.autoSave = autoSave
        this.init_status = init_status
        this.name = name
        this.lastLocalPath = lastLocalPath
        this.editorExpandContent = editorExpandContent
        this.activeSystemMode = activeSystemMode
        this.dynamicEffect = dynamicEffect
        this.watchAllExtensions = watchAllExtensions
        this.theme = theme
        this.readonly = readonly
        this.aiOption = aiOption
        this.data_path = data_path
        this.userId = userId
    }
       
    /**
     * 
     * @type {String}
     */
    language=undefined
    
}
export class ConfigSystemMode {
  
    /**
     *

     */ 
    constructor(){
        
    }
    
    
}
export class ConfigTheme {
  
    /**
     *

     */ 
    constructor(){
        
    }
    
    
}
export class DataItemCreateRequest {
  
    /**
     *
     * @param {String} name 
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
    
}
export class DataItemUpdateRequest {
  
    /**
     *

     */ 
    constructor(name = undefined,emoji = undefined,id = undefined,pdfId = undefined,labels = undefined){
        this.name = name
        this.emoji = emoji
        this.id = id
        this.pdfId = pdfId
        this.labels = labels
    }
    
    
}
export class DataPageCreateRequest {
  
    /**
     *
     * @param {String} name 
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
    
}
export class DataPageUpdateRequest {
  
    /**
     *

     */ 
    constructor(id = undefined,name = undefined,emoji = undefined,parent = undefined){
        this.id = id
        this.name = name
        this.emoji = emoji
        this.parent = parent
    }
    
    
}
export class DataPathItemPayload {
  
    /**
     *

     */ 
    constructor(path = undefined,shared = undefined,local = undefined,type = undefined){
        this.path = path
        this.shared = shared
        this.local = local
        this.type = type
    }
    
    
}
export class DataSourceCreateRequest {
  
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
export class DataSourceUpdateRequest {
  
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
export class DataTemplateCreateRequest {
  
    /**
     *
     * @param {String} name 
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
    
}
export class DataTemplateUpdateRequest {
  
    /**
     *
     * @param {String} id 
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
    
}
export class GroupCreateRequest {
  
    /**
     *
     * @param {String} name 
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
    
}
export class GroupUpdateRequest {
  
    /**
     *

     */ 
    constructor(id = undefined,name = undefined,emoji = undefined,parent = undefined,protect = undefined){
        this.id = id
        this.name = name
        this.emoji = emoji
        this.parent = parent
        this.protect = protect
    }
    
    
}
export class HTTPValidationError {
  
    /**
     *
     * @param {Array} detail 
     */ 
    constructor(detail = undefined){
        this.detail = detail
    }
       
    /**
     * 
     * @type {Array}
     */
    detail=undefined
    
}
export class ItemLabel {
  
    /**
     *

     */ 
    constructor(text = undefined,background = undefined){
        this.text = text
        this.background = background
    }
    
    
}
export class MetadataUpdateRequest {
  
    /**
     *

     */ 
    constructor(id = undefined,publisher = undefined,DOI = undefined,year = undefined,createDate = undefined,source = undefined,title = undefined,url = undefined,containerTitle = undefined,abstract = undefined,ISSN = undefined,language = undefined,chapter = undefined,pages = undefined,school = undefined,bibtex = undefined,note = undefined){
        this.id = id
        this.publisher = publisher
        this.DOI = DOI
        this.year = year
        this.createDate = createDate
        this.source = source
        this.title = title
        this.url = url
        this.containerTitle = containerTitle
        this.abstract = abstract
        this.ISSN = ISSN
        this.language = language
        this.chapter = chapter
        this.pages = pages
        this.school = school
        this.bibtex = bibtex
        this.note = note
    }
    
    
}
export class NotebookUpdateRequest {
  
    /**
     *

     */ 
    constructor(name = undefined,emoji = undefined){
        this.name = name
        this.emoji = emoji
    }
    
    
}
export class PartitionCreateRequest {
  
    /**
     *
     * @param {String} name 
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
    
}
export class PartitionUpdateRequest {
  
    /**
     *
     * @param {String} id 
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
    
}
export class RoleRequest {
  
    /**
     *
     * @param {String} name 
     */ 
    constructor(name = undefined,description = undefined){
        this.name = name
        this.description = description
    }
       
    /**
     * 
     * @type {String}
     */
    name=undefined
    
}
export class SourcePathPermissionUpsertRequest {
  
    /**
     *
     * @param {String} permissionCode 
     * @param {undefined} cascade 
     * @param {undefined} decascade 
     */ 
    constructor(permissionCode = undefined,cascade = undefined,decascade = undefined){
        this.permissionCode = permissionCode
        this.cascade = cascade
        this.decascade = decascade
    }
       
    /**
     * 
     * @type {String}
     */
    permissionCode=undefined   
    /**
     * 
     * @type {undefined}
     */
    cascade=undefined   
    /**
     * 
     * @type {undefined}
     */
    decascade=undefined
    
}
export class SourcePermissionGroupCreateRequest {
  
    /**
     *
     * @param {String} name 
     * @param {String} permissionCode 
     */ 
    constructor(name = undefined,description = undefined,permissionCode = undefined){
        this.name = name
        this.description = description
        this.permissionCode = permissionCode
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
    permissionCode=undefined
    
}
export class SourcePermissionGroupInviteAcceptRequest {
  
    /**
     *
     * @param {String} inviteCode 
     */ 
    constructor(inviteCode = undefined){
        this.inviteCode = inviteCode
    }
       
    /**
     * 
     * @type {String}
     */
    inviteCode=undefined
    
}
export class SourcePermissionGroupInviteCreateRequest {
  
    /**
     *
     * @param {Number} expireDays 
     */ 
    constructor(expireDays = undefined,userRole = undefined){
        this.expireDays = expireDays
        this.userRole = userRole
    }
       
    /**
     * 
     * @type {Number}
     */
    expireDays=undefined
    
}
export class SourcePermissionGroupUpdateRequest {
  
    /**
     *

     */ 
    constructor(name = undefined,description = undefined,permissionCode = undefined){
        this.name = name
        this.description = description
        this.permissionCode = permissionCode
    }
    
    
}
export class SourcePermissionGroupUserCreateRequest {
  
    /**
     *
     * @param {String} userId 
     */ 
    constructor(userId = undefined,userRole = undefined){
        this.userId = userId
        this.userRole = userRole
    }
       
    /**
     * 
     * @type {String}
     */
    userId=undefined
    
}
export class SourcePermissionGroupUserUpdateRequest {
  
    /**
     *

     */ 
    constructor(userId = undefined,userRole = undefined){
        this.userId = userId
        this.userRole = userRole
    }
    
    
}
export class UpdateAvatarRequest {
  
    /**
     *
     * @param {String} avatar 
     */ 
    constructor(avatar = undefined){
        this.avatar = avatar
    }
       
    /**
     * 
     * @type {String}
     */
    avatar=undefined
    
}
export class UpdatePasswordRequest {
  
    /**
     *
     * @param {String} password 
     * @param {String} code 
     */ 
    constructor(password = undefined,code = undefined){
        this.password = password
        this.code = code
    }
       
    /**
     * 
     * @type {String}
     */
    password=undefined   
    /**
     * 
     * @type {String}
     */
    code=undefined
    
}
export class UserLoginRequest {
  
    /**
     *
     * @param {String} id Login identifier: user GUID, email, or phone
     * @param {String} password 
     */ 
    constructor(id = undefined,password = undefined,code = undefined){
        this.id = id
        this.password = password
        this.code = code
    }
       
    /**
     * Login identifier: user GUID, email, or phone
     * @type {String}
     */
    id=undefined   
    /**
     * 
     * @type {String}
     */
    password=undefined
    
}
export class UserRegisterRequest {
  
    /**
     *
     * @param {String} password 
     * @param {String} email 
     */ 
    constructor(name = undefined,password = undefined,email = undefined,phone = undefined,nickname = undefined){
        this.name = name
        this.password = password
        this.email = email
        this.phone = phone
        this.nickname = nickname
    }
       
    /**
     * 
     * @type {String}
     */
    password=undefined   
    /**
     * 
     * @type {String}
     */
    email=undefined
    
}
export class UserUpdateRequest {
  
    /**
     *

     */ 
    constructor(name = undefined,nickname = undefined,email = undefined,phone = undefined,gender = undefined,idcard = undefined,birth = undefined){
        this.name = name
        this.nickname = nickname
        this.email = email
        this.phone = phone
        this.gender = gender
        this.idcard = idcard
        this.birth = birth
    }
    
    
}
export class ValidationError {
  
    /**
     *
     * @param {Array} loc 
     * @param {String} msg 
     * @param {String} type 
     * @param {undefined} ctx 
     */ 
    constructor(loc = undefined,msg = undefined,type = undefined,input = undefined,ctx = undefined){
        this.loc = loc
        this.msg = msg
        this.type = type
        this.input = input
        this.ctx = ctx
    }
       
    /**
     * 
     * @type {Array}
     */
    loc=undefined   
    /**
     * 
     * @type {String}
     */
    msg=undefined   
    /**
     * 
     * @type {String}
     */
    type=undefined   
    /**
     * 
     * @type {undefined}
     */
    ctx=undefined
    
}
