/* eslint-disable */
// More information: https://github.com/minskiter/openapijs
import axios from './config.js'
import {CancelTokenSource} from 'axios'
import * as UserModel from './model.js'

axios.interceptors.request.use(
  config => {
    if (
      config.headers["Content-Type"].includes("x-www-form-urlencoded") ||
      config.headers["Content-Type"].includes("multipart/form-data")
    ) {
      let formData = new FormData();
      for (let item in config.data) {
        if (config.data[item])
        if (
          typeof config.data[item] == "object" &&
          Array.isArray(config.data[item])
        ){  
          for (let index in config.data[item]){
              let i = config.data[item][index];
              formData.append(item,i);
          }
        }
        else formData.append(item, config.data[item]);
      }
      config.data = formData;
    }
    return config;
  },
  error=>{
    return Promise.reject(error)
  }
)
export class AcademicController {
 
  /**
  * @summary 获取模版的信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getTemplateInfo(pathuri,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/templates',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新模版
  * @param {String} [pathuri] 
  * @param {UserModel.DataTemplateUpdateDTO} [datatemplateupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateTemplate(pathuri,datatemplateupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/templates',
        data:datatemplateupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建模版
  * @param {String} [pathuri] 
  * @param {UserModel.DataTemplateCreateDTO} [datatemplatecreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createTemplate(pathuri,datatemplatecreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/templates',
        data:datatemplatecreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取当前数据源下的所有数据项信息
  * @param {String} [pathuri] 
  * @param {Number} [length] 
  * @param {Number} [offset] 
  * @param {String} [sort] 
  * @param {undefined} [desc] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllItems(pathuri,length,offset,sort,desc,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items',
        data:{},
        params:{length,offset,sort,desc},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新数据项
  * @param {String} [pathuri] 
  * @param {UserModel.DataItemUpdateDTO} [dataitemupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItem(pathuri,dataitemupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/items',
        data:dataitemupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建数据项
  * @param {String} [pathuri] 
  * @param {UserModel.DataItemCreateDTO} [dataitemcreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createItem(pathuri,dataitemcreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items',
        data:dataitemcreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新数据项笔记信息
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.DataPageUpdateDTO} [datapageupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItemPage(pathuri,pathitemid,datapageupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages',
        data:datapageupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建数据项的笔记
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.DataPageCreateDTO} [datapagecreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createItemPage(pathuri,pathitemid,datapagecreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages',
        data:datapagecreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新数据项的元信息
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.MetadataUpdateDTO} [metadataupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItemMetadata(pathuri,pathitemid,metadataupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/metadata',
        data:metadataupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取根目录下的所有区组信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getRootGroups(pathuri,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/groups',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新区组
  * @param {String} [pathuri] 
  * @param {UserModel.GroupUpdateDTO} [groupupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateGroup(pathuri,groupupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/groups',
        data:groupupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新分区
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.PartitionUpdateDTO} [partitionupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updatePartition(pathuri,pathgroupid,partitionupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/groups/'+pathgroupid+'/partitions',
        data:partitionupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建分区
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.PartitionCreateDTO} [partitioncreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createPartition(pathuri,pathgroupid,partitioncreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/groups/'+pathgroupid+'/partitions',
        data:partitioncreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 保存模版的内容
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {String} [pathversionid] 
  * @param {string} [string] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async saveTemplateContent(pathuri,pathid,pathversionid,string,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/templates/'+pathid+'/versions/'+pathversionid+'',
        data:string,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 将数据项添加到指定分区
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {array} [array] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addItemsToPartition(pathuri,pathpartitionid,array,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items/batched',
        data:array,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 从分区移除数据项
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {array} [array] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeItemsFromPartition(pathuri,pathpartitionid,array,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items/batched/deleted',
        data:array,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 保存Pdf文件
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pdfid] 
  * @param {String} [file] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItemPDF(pathuri,pathitemid,pdfid,file,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pdfs',
        data:{pdfid,file},
        params:{},
        headers:{
          "Content-Type":"multipart/form-data"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 复制数据项笔记
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async duplicateItemPage(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/duplicate',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 保存笔记的内容
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {String} [pathversionid] 
  * @param {string} [string] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async saveItemPageContent(pathuri,pathitemid,pathpageid,pathversionid,string,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/content/versions/'+pathversionid+'',
        data:string,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除多个数据项
  * @param {String} [pathuri] 
  * @param {array} [array] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteItems(pathuri,array,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/batched/deleted',
        data:array,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定区组下的所有区组信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getGroups(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/groups/'+pathid+'/subgroups',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建区组
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {UserModel.GroupCreateDTO} [groupcreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createGroup(pathuri,pathid,groupcreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/groups/'+pathid+'/subgroups',
        data:groupcreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取模版的内容
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getTemplateContent(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/templates/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除模版
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteTemplate(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/templates/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取根目录下的所有分区信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getRootPartitions(pathuri,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定分区下的所有数据项信息
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {Number} [length] 
  * @param {Number} [offset] 
  * @param {String} [sort] 
  * @param {undefined} [desc] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItems(pathuri,pathpartitionid,length,offset,sort,desc,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items',
        data:{},
        params:{length,offset,sort,desc},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定分区下的所有数据项数量
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemsCount(pathuri,pathpartitionid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items/count',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定分区信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getPartition(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 搜索获取数据项信息
  * @param {String} [pathuri] 
  * @param {String} [partitionid] 
  * @param {String} [keyword] 
  * @param {Number} [length] 
  * @param {Number} [offset] 
  * @param {String} [sort] 
  * @param {undefined} [desc] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSearchItems(pathuri,partitionid,keyword,length,offset,sort,desc,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/items/matches',
        data:{},
        params:{partitionid,keyword,length,offset,sort,desc},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取数据项的Pdf文件
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpdfid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemPDF(pathuri,pathitemid,pathpdfid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "blob";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pdfs/'+pathpdfid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取数据源的临时链接
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathfileid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async openItemFile(pathuri,pathitemid,pathfileid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pdfs/'+pathfileid+'/link',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取文献笔记的历史
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listItemPageVersions(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/versions',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记的内容
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemPageContent(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/content',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 根据数据项id获取指定数据项信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItem(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除数据项
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteItem(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/items/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取当前数据源下的所有数据项数量
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllItemsCount(pathuri,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/count',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取数据源的信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDataSourceInfo(pathuri,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定区组下的所有分区信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getPartitions(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/groups/'+pathid+'/subpartitions',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除数据项笔记
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteItemPage(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除区组
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteGroup(pathuri,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/groups/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除分区
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deletePartition(pathuri,pathgroupid,pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/groups/'+pathgroupid+'/partitions/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class AcademicController static method properties bind
/**
* @description getTemplateInfo url链接，包含baseURL
*/
AcademicController.getTemplateInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates`
/**
* @description getTemplateInfo url链接，不包含baseURL
*/
AcademicController.getTemplateInfo.path=`/sources/{uri}/templates`
/**
* @description updateTemplate url链接，包含baseURL
*/
AcademicController.updateTemplate.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates`
/**
* @description updateTemplate url链接，不包含baseURL
*/
AcademicController.updateTemplate.path=`/sources/{uri}/templates`
/**
* @description createTemplate url链接，包含baseURL
*/
AcademicController.createTemplate.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates`
/**
* @description createTemplate url链接，不包含baseURL
*/
AcademicController.createTemplate.path=`/sources/{uri}/templates`
/**
* @description getAllItems url链接，包含baseURL
*/
AcademicController.getAllItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items`
/**
* @description getAllItems url链接，不包含baseURL
*/
AcademicController.getAllItems.path=`/sources/{uri}/items`
/**
* @description updateItem url链接，包含baseURL
*/
AcademicController.updateItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items`
/**
* @description updateItem url链接，不包含baseURL
*/
AcademicController.updateItem.path=`/sources/{uri}/items`
/**
* @description createItem url链接，包含baseURL
*/
AcademicController.createItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items`
/**
* @description createItem url链接，不包含baseURL
*/
AcademicController.createItem.path=`/sources/{uri}/items`
/**
* @description updateItemPage url链接，包含baseURL
*/
AcademicController.updateItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages`
/**
* @description updateItemPage url链接，不包含baseURL
*/
AcademicController.updateItemPage.path=`/sources/{uri}/items/{itemId}/pages`
/**
* @description createItemPage url链接，包含baseURL
*/
AcademicController.createItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages`
/**
* @description createItemPage url链接，不包含baseURL
*/
AcademicController.createItemPage.path=`/sources/{uri}/items/{itemId}/pages`
/**
* @description updateItemMetadata url链接，包含baseURL
*/
AcademicController.updateItemMetadata.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/metadata`
/**
* @description updateItemMetadata url链接，不包含baseURL
*/
AcademicController.updateItemMetadata.path=`/sources/{uri}/items/{itemId}/metadata`
/**
* @description getRootGroups url链接，包含baseURL
*/
AcademicController.getRootGroups.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups`
/**
* @description getRootGroups url链接，不包含baseURL
*/
AcademicController.getRootGroups.path=`/sources/{uri}/groups`
/**
* @description updateGroup url链接，包含baseURL
*/
AcademicController.updateGroup.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups`
/**
* @description updateGroup url链接，不包含baseURL
*/
AcademicController.updateGroup.path=`/sources/{uri}/groups`
/**
* @description updatePartition url链接，包含baseURL
*/
AcademicController.updatePartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{groupId}/partitions`
/**
* @description updatePartition url链接，不包含baseURL
*/
AcademicController.updatePartition.path=`/sources/{uri}/groups/{groupId}/partitions`
/**
* @description createPartition url链接，包含baseURL
*/
AcademicController.createPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{groupId}/partitions`
/**
* @description createPartition url链接，不包含baseURL
*/
AcademicController.createPartition.path=`/sources/{uri}/groups/{groupId}/partitions`
/**
* @description saveTemplateContent url链接，包含baseURL
*/
AcademicController.saveTemplateContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates/{id}/versions/{versionId}`
/**
* @description saveTemplateContent url链接，不包含baseURL
*/
AcademicController.saveTemplateContent.path=`/sources/{uri}/templates/{id}/versions/{versionId}`
/**
* @description addItemsToPartition url链接，包含baseURL
*/
AcademicController.addItemsToPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items/batched`
/**
* @description addItemsToPartition url链接，不包含baseURL
*/
AcademicController.addItemsToPartition.path=`/sources/{uri}/partitions/{partitionId}/items/batched`
/**
* @description removeItemsFromPartition url链接，包含baseURL
*/
AcademicController.removeItemsFromPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items/batched/deleted`
/**
* @description removeItemsFromPartition url链接，不包含baseURL
*/
AcademicController.removeItemsFromPartition.path=`/sources/{uri}/partitions/{partitionId}/items/batched/deleted`
/**
* @description updateItemPDF url链接，包含baseURL
*/
AcademicController.updateItemPDF.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pdfs`
/**
* @description updateItemPDF url链接，不包含baseURL
*/
AcademicController.updateItemPDF.path=`/sources/{uri}/items/{itemId}/pdfs`
/**
* @description duplicateItemPage url链接，包含baseURL
*/
AcademicController.duplicateItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/duplicate`
/**
* @description duplicateItemPage url链接，不包含baseURL
*/
AcademicController.duplicateItemPage.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/duplicate`
/**
* @description saveItemPageContent url链接，包含baseURL
*/
AcademicController.saveItemPageContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/content/versions/{versionId}`
/**
* @description saveItemPageContent url链接，不包含baseURL
*/
AcademicController.saveItemPageContent.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/content/versions/{versionId}`
/**
* @description deleteItems url链接，包含baseURL
*/
AcademicController.deleteItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/batched/deleted`
/**
* @description deleteItems url链接，不包含baseURL
*/
AcademicController.deleteItems.path=`/sources/{uri}/items/batched/deleted`
/**
* @description getGroups url链接，包含baseURL
*/
AcademicController.getGroups.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}/subgroups`
/**
* @description getGroups url链接，不包含baseURL
*/
AcademicController.getGroups.path=`/sources/{uri}/groups/{id}/subgroups`
/**
* @description createGroup url链接，包含baseURL
*/
AcademicController.createGroup.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}/subgroups`
/**
* @description createGroup url链接，不包含baseURL
*/
AcademicController.createGroup.path=`/sources/{uri}/groups/{id}/subgroups`
/**
* @description getTemplateContent url链接，包含baseURL
*/
AcademicController.getTemplateContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates/{id}`
/**
* @description getTemplateContent url链接，不包含baseURL
*/
AcademicController.getTemplateContent.path=`/sources/{uri}/templates/{id}`
/**
* @description deleteTemplate url链接，包含baseURL
*/
AcademicController.deleteTemplate.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates/{id}`
/**
* @description deleteTemplate url链接，不包含baseURL
*/
AcademicController.deleteTemplate.path=`/sources/{uri}/templates/{id}`
/**
* @description getRootPartitions url链接，包含baseURL
*/
AcademicController.getRootPartitions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions`
/**
* @description getRootPartitions url链接，不包含baseURL
*/
AcademicController.getRootPartitions.path=`/sources/{uri}/partitions`
/**
* @description getItems url链接，包含baseURL
*/
AcademicController.getItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items`
/**
* @description getItems url链接，不包含baseURL
*/
AcademicController.getItems.path=`/sources/{uri}/partitions/{partitionId}/items`
/**
* @description getItemsCount url链接，包含baseURL
*/
AcademicController.getItemsCount.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items/count`
/**
* @description getItemsCount url链接，不包含baseURL
*/
AcademicController.getItemsCount.path=`/sources/{uri}/partitions/{partitionId}/items/count`
/**
* @description getPartition url链接，包含baseURL
*/
AcademicController.getPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{id}`
/**
* @description getPartition url链接，不包含baseURL
*/
AcademicController.getPartition.path=`/sources/{uri}/partitions/{id}`
/**
* @description getSearchItems url链接，包含baseURL
*/
AcademicController.getSearchItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/items/matches`
/**
* @description getSearchItems url链接，不包含baseURL
*/
AcademicController.getSearchItems.path=`/sources/{uri}/partitions/items/matches`
/**
* @description getItemPDF url链接，包含baseURL
*/
AcademicController.getItemPDF.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pdfs/{pdfId}`
/**
* @description getItemPDF url链接，不包含baseURL
*/
AcademicController.getItemPDF.path=`/sources/{uri}/items/{itemId}/pdfs/{pdfId}`
/**
* @description openItemFile url链接，包含baseURL
*/
AcademicController.openItemFile.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pdfs/{fileId}/link`
/**
* @description openItemFile url链接，不包含baseURL
*/
AcademicController.openItemFile.path=`/sources/{uri}/items/{itemId}/pdfs/{fileId}/link`
/**
* @description listItemPageVersions url链接，包含baseURL
*/
AcademicController.listItemPageVersions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/versions`
/**
* @description listItemPageVersions url链接，不包含baseURL
*/
AcademicController.listItemPageVersions.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/versions`
/**
* @description getItemPageContent url链接，包含baseURL
*/
AcademicController.getItemPageContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/content`
/**
* @description getItemPageContent url链接，不包含baseURL
*/
AcademicController.getItemPageContent.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/content`
/**
* @description getItem url链接，包含baseURL
*/
AcademicController.getItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{id}`
/**
* @description getItem url链接，不包含baseURL
*/
AcademicController.getItem.path=`/sources/{uri}/items/{id}`
/**
* @description deleteItem url链接，包含baseURL
*/
AcademicController.deleteItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{id}`
/**
* @description deleteItem url链接，不包含baseURL
*/
AcademicController.deleteItem.path=`/sources/{uri}/items/{id}`
/**
* @description getAllItemsCount url链接，包含baseURL
*/
AcademicController.getAllItemsCount.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/count`
/**
* @description getAllItemsCount url链接，不包含baseURL
*/
AcademicController.getAllItemsCount.path=`/sources/{uri}/items/count`
/**
* @description getDataSourceInfo url链接，包含baseURL
*/
AcademicController.getDataSourceInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/info`
/**
* @description getDataSourceInfo url链接，不包含baseURL
*/
AcademicController.getDataSourceInfo.path=`/sources/{uri}/info`
/**
* @description getPartitions url链接，包含baseURL
*/
AcademicController.getPartitions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}/subpartitions`
/**
* @description getPartitions url链接，不包含baseURL
*/
AcademicController.getPartitions.path=`/sources/{uri}/groups/{id}/subpartitions`
/**
* @description deleteItemPage url链接，包含baseURL
*/
AcademicController.deleteItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}`
/**
* @description deleteItemPage url链接，不包含baseURL
*/
AcademicController.deleteItemPage.path=`/sources/{uri}/items/{itemId}/pages/{pageId}`
/**
* @description deleteGroup url链接，包含baseURL
*/
AcademicController.deleteGroup.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}`
/**
* @description deleteGroup url链接，不包含baseURL
*/
AcademicController.deleteGroup.path=`/sources/{uri}/groups/{id}`
/**
* @description deletePartition url链接，包含baseURL
*/
AcademicController.deletePartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{groupId}/partitions/{id}`
/**
* @description deletePartition url链接，不包含baseURL
*/
AcademicController.deletePartition.path=`/sources/{uri}/groups/{groupId}/partitions/{id}`

export class NotebookController {
 
  /**
  * @summary 更新笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {String} [versionid] 
  * @param {string} [string] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDocument(pathuri,filepath,versionid,string,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/documents/content',
        data:string,
        params:{filepath,versionid},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新指定的目录信息
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {UserModel.GroupUpdateDTO} [groupupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDirectoryInfo(pathuri,filepath,groupupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/directories/info',
        data:groupupdatedto,
        params:{filepath},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocument(pathuri,filepath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/documents',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {string} [string] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createDocument(pathuri,filepath,string,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/documents',
        data:string,
        params:{filepath},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeDocument(pathuri,filepath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/documents',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建指定的目录
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createDirectory(pathuri,filepath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/directories',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除指定的目录或笔记
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeDirectory(pathuri,filepath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/directories',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 移动目录或文件
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {String} [newpath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async moveDirectory(pathuri,filepath,newpath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/directories/move',
        data:{},
        params:{filepath,newpath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 复制目录或文件
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {String} [newpath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async copyDirectory(pathuri,filepath,newpath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/directories/copy',
        data:{},
        params:{filepath,newpath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 判断指定路径是否存在,路径以/间隔,格式例如: {GUID}/{GUID}/{GUID}
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async existsPath(pathuri,filepath,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/path',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取路径对应的名称路径
  * @param {String} [path] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async transferIdsToNames(path,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/notebooks/names',
        data:{},
        params:{path},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记本指定版本的内容
  * @param {String} [pathnotebookid] 
  * @param {String} [pathids] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocumentContentHistoryByVersionIds(pathnotebookid,pathids,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/documents/'+pathnotebookid+'/content/'+pathids+'/history/',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记本内容的历史
  * @param {String} [pathid] 
  * @param {Number} [pagesize] 
  * @param {String} [lastversionid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocumentContentHistory(pathid,pagesize,lastversionid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/documents/'+pathid+'/content/history',
        data:{},
        params:{pagesize,lastversionid},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记本内容所有历史版本号
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocumentContentHistoryVersionIds(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/documents/'+pathid+'/content/history/ids',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定目录的信息
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDirectory(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/directories/'+pathid+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定目录的所有子项
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDirectoryChildren(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/directories/'+pathid+'/children',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class NotebookController static method properties bind
/**
* @description updateDocument url链接，包含baseURL
*/
NotebookController.updateDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents/content`
/**
* @description updateDocument url链接，不包含baseURL
*/
NotebookController.updateDocument.path=`/sources/{uri}/documents/content`
/**
* @description updateDirectoryInfo url链接，包含baseURL
*/
NotebookController.updateDirectoryInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/info`
/**
* @description updateDirectoryInfo url链接，不包含baseURL
*/
NotebookController.updateDirectoryInfo.path=`/sources/{uri}/directories/info`
/**
* @description getDocument url链接，包含baseURL
*/
NotebookController.getDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents`
/**
* @description getDocument url链接，不包含baseURL
*/
NotebookController.getDocument.path=`/sources/{uri}/documents`
/**
* @description createDocument url链接，包含baseURL
*/
NotebookController.createDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents`
/**
* @description createDocument url链接，不包含baseURL
*/
NotebookController.createDocument.path=`/sources/{uri}/documents`
/**
* @description removeDocument url链接，包含baseURL
*/
NotebookController.removeDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents`
/**
* @description removeDocument url链接，不包含baseURL
*/
NotebookController.removeDocument.path=`/sources/{uri}/documents`
/**
* @description createDirectory url链接，包含baseURL
*/
NotebookController.createDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories`
/**
* @description createDirectory url链接，不包含baseURL
*/
NotebookController.createDirectory.path=`/sources/{uri}/directories`
/**
* @description removeDirectory url链接，包含baseURL
*/
NotebookController.removeDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories`
/**
* @description removeDirectory url链接，不包含baseURL
*/
NotebookController.removeDirectory.path=`/sources/{uri}/directories`
/**
* @description moveDirectory url链接，包含baseURL
*/
NotebookController.moveDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/move`
/**
* @description moveDirectory url链接，不包含baseURL
*/
NotebookController.moveDirectory.path=`/sources/{uri}/directories/move`
/**
* @description copyDirectory url链接，包含baseURL
*/
NotebookController.copyDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/copy`
/**
* @description copyDirectory url链接，不包含baseURL
*/
NotebookController.copyDirectory.path=`/sources/{uri}/directories/copy`
/**
* @description existsPath url链接，包含baseURL
*/
NotebookController.existsPath.fullPath=`${axios.defaults.baseURL}/sources/{uri}/path`
/**
* @description existsPath url链接，不包含baseURL
*/
NotebookController.existsPath.path=`/sources/{uri}/path`
/**
* @description transferIdsToNames url链接，包含baseURL
*/
NotebookController.transferIdsToNames.fullPath=`${axios.defaults.baseURL}/sources/notebooks/names`
/**
* @description transferIdsToNames url链接，不包含baseURL
*/
NotebookController.transferIdsToNames.path=`/sources/notebooks/names`
/**
* @description getDocumentContentHistoryByVersionIds url链接，包含baseURL
*/
NotebookController.getDocumentContentHistoryByVersionIds.fullPath=`${axios.defaults.baseURL}/documents/{notebookId}/content/{ids}/history/`
/**
* @description getDocumentContentHistoryByVersionIds url链接，不包含baseURL
*/
NotebookController.getDocumentContentHistoryByVersionIds.path=`/documents/{notebookId}/content/{ids}/history/`
/**
* @description getDocumentContentHistory url链接，包含baseURL
*/
NotebookController.getDocumentContentHistory.fullPath=`${axios.defaults.baseURL}/documents/{id}/content/history`
/**
* @description getDocumentContentHistory url链接，不包含baseURL
*/
NotebookController.getDocumentContentHistory.path=`/documents/{id}/content/history`
/**
* @description getDocumentContentHistoryVersionIds url链接，包含baseURL
*/
NotebookController.getDocumentContentHistoryVersionIds.fullPath=`${axios.defaults.baseURL}/documents/{id}/content/history/ids`
/**
* @description getDocumentContentHistoryVersionIds url链接，不包含baseURL
*/
NotebookController.getDocumentContentHistoryVersionIds.path=`/documents/{id}/content/history/ids`
/**
* @description getDirectory url链接，包含baseURL
*/
NotebookController.getDirectory.fullPath=`${axios.defaults.baseURL}/directories/{id}/info`
/**
* @description getDirectory url链接，不包含baseURL
*/
NotebookController.getDirectory.path=`/directories/{id}/info`
/**
* @description getDirectoryChildren url链接，包含baseURL
*/
NotebookController.getDirectoryChildren.fullPath=`${axios.defaults.baseURL}/directories/{id}/children`
/**
* @description getDirectoryChildren url链接，不包含baseURL
*/
NotebookController.getDirectoryChildren.path=`/directories/{id}/children`

export class ConfigController {
 
  /**
  * @summary 更新数据源的信息
  * @param {String} [pathid] 
  * @param {UserModel.DataSourceUpdateDTO} [datasourceupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDataSource(pathid,datasourceupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/configs/sources/'+pathid+'',
        data:datasourceupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除数据源
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeDataSource(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/configs/sources/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建或者更新用户配置文件
  * @param {UserModel.ConfigCreateOrUpdateDTO} [configcreateorupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createOrUpdateConfig(configcreateorupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs',
        data:configcreateorupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建数据源
  * @param {UserModel.DataSourceCreateDTO} [datasourcecreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createDataSource(datasourcecreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/sources',
        data:datasourcecreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取用户的配置文件
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getConfig(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/me/config',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 监听数据源的变化
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async watchDataSource(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/chokidar',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取数据源的信息
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSourceInfo(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/config/sources/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class ConfigController static method properties bind
/**
* @description updateDataSource url链接，包含baseURL
*/
ConfigController.updateDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}`
/**
* @description updateDataSource url链接，不包含baseURL
*/
ConfigController.updateDataSource.path=`/configs/sources/{id}`
/**
* @description removeDataSource url链接，包含baseURL
*/
ConfigController.removeDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}`
/**
* @description removeDataSource url链接，不包含baseURL
*/
ConfigController.removeDataSource.path=`/configs/sources/{id}`
/**
* @description createOrUpdateConfig url链接，包含baseURL
*/
ConfigController.createOrUpdateConfig.fullPath=`${axios.defaults.baseURL}/configs`
/**
* @description createOrUpdateConfig url链接，不包含baseURL
*/
ConfigController.createOrUpdateConfig.path=`/configs`
/**
* @description createDataSource url链接，包含baseURL
*/
ConfigController.createDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources`
/**
* @description createDataSource url链接，不包含baseURL
*/
ConfigController.createDataSource.path=`/configs/sources`
/**
* @description getConfig url链接，包含baseURL
*/
ConfigController.getConfig.fullPath=`${axios.defaults.baseURL}/me/config`
/**
* @description getConfig url链接，不包含baseURL
*/
ConfigController.getConfig.path=`/me/config`
/**
* @description watchDataSource url链接，包含baseURL
*/
ConfigController.watchDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/chokidar`
/**
* @description watchDataSource url链接，不包含baseURL
*/
ConfigController.watchDataSource.path=`/configs/sources/{id}/chokidar`
/**
* @description getSourceInfo url链接，包含baseURL
*/
ConfigController.getSourceInfo.fullPath=`${axios.defaults.baseURL}/config/sources/{id}`
/**
* @description getSourceInfo url链接，不包含baseURL
*/
ConfigController.getSourceInfo.path=`/config/sources/{id}`

export class UserController {
 
  /**
  * @summary 用户注册
  * @param {UserModel.UserRegister} [userregister] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async register(userregister,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users',
        data:userregister,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 为用户添加角色
  * @param {String} [pathuserid] 
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addRoleToUser(pathuserid,pathroleid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathuserid+'/roles/'+pathroleid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 为用户删除角色
  * @param {String} [pathuserid] 
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeRoleFromUser(pathuserid,pathroleid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/users/'+pathuserid+'/roles/'+pathroleid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 用户修改密码
  * @param {String} [pathid] 
  * @param {UserModel.UserUpdatePassword} [userupdatepassword] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updatePassword(pathid,userupdatepassword,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/password',
        data:userupdatepassword,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 发送忘记密码邮件
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async sendForgotVerifiedEmail(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/forgot/code',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 发送验证邮件
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async sendVerifiedEmail(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/email/code',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 用户登陆
  * @param {UserModel.UserLogin} [userlogin] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async login(userlogin,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/session',
        data:userlogin,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取所有的角色
  * @param {String} [query] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllRoles(query,offset,pagesize,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/roles',
        data:{},
        params:{query,offset,pagesize},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建角色
  * @param {UserModel.RoleRequest} [rolerequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createRole(rolerequest,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/roles',
        data:rolerequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 我的信息
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyUserInfo(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/me/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新我的信息
  * @param {UserModel.UserUpdate} [userupdate] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateMyUserInfo(userupdate,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/me/info',
        data:userupdate,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取我的头像
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyAvatar(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/me/avatar',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新我的头像
  * @param {UserModel.UpdateAvatarRequest} [updateavatarrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateMyAvatar(updateavatarrequest,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/me/avatar',
        data:updateavatarrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取用户的信息
  * @param {String} [pathuserid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserById(pathuserid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathuserid+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定用户的角色
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserRoles(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathid+'/roles',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定用户的头像
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAvatar(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathid+'/avatar',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取我的角色
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyRoles(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/me/roles',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 查询用户信息
  * @param {String} [query] 
  * @param {String} [gender] 
  * @param {String} [offset] 
  * @param {String} [pagesize] 
  * @param {String} [sortkey] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUsers(query,gender,offset,pagesize,sortkey,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/info',
        data:{},
        params:{query,gender,offset,pagesize,sortkey},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取用户的Id
  * @param {String} [pathuserids] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserByIds(pathuserids,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/batched/'+pathuserids+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除角色
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteRole(pathroleid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/users/roles/'+pathroleid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class UserController static method properties bind
/**
* @description register url链接，包含baseURL
*/
UserController.register.fullPath=`${axios.defaults.baseURL}/users`
/**
* @description register url链接，不包含baseURL
*/
UserController.register.path=`/users`
/**
* @description addRoleToUser url链接，包含baseURL
*/
UserController.addRoleToUser.fullPath=`${axios.defaults.baseURL}/users/{userId}/roles/{roleId}`
/**
* @description addRoleToUser url链接，不包含baseURL
*/
UserController.addRoleToUser.path=`/users/{userId}/roles/{roleId}`
/**
* @description removeRoleFromUser url链接，包含baseURL
*/
UserController.removeRoleFromUser.fullPath=`${axios.defaults.baseURL}/users/{userId}/roles/{roleId}`
/**
* @description removeRoleFromUser url链接，不包含baseURL
*/
UserController.removeRoleFromUser.path=`/users/{userId}/roles/{roleId}`
/**
* @description updatePassword url链接，包含baseURL
*/
UserController.updatePassword.fullPath=`${axios.defaults.baseURL}/users/{id}/password`
/**
* @description updatePassword url链接，不包含baseURL
*/
UserController.updatePassword.path=`/users/{id}/password`
/**
* @description sendForgotVerifiedEmail url链接，包含baseURL
*/
UserController.sendForgotVerifiedEmail.fullPath=`${axios.defaults.baseURL}/users/{id}/forgot/code`
/**
* @description sendForgotVerifiedEmail url链接，不包含baseURL
*/
UserController.sendForgotVerifiedEmail.path=`/users/{id}/forgot/code`
/**
* @description sendVerifiedEmail url链接，包含baseURL
*/
UserController.sendVerifiedEmail.fullPath=`${axios.defaults.baseURL}/users/{id}/email/code`
/**
* @description sendVerifiedEmail url链接，不包含baseURL
*/
UserController.sendVerifiedEmail.path=`/users/{id}/email/code`
/**
* @description login url链接，包含baseURL
*/
UserController.login.fullPath=`${axios.defaults.baseURL}/users/session`
/**
* @description login url链接，不包含baseURL
*/
UserController.login.path=`/users/session`
/**
* @description getAllRoles url链接，包含baseURL
*/
UserController.getAllRoles.fullPath=`${axios.defaults.baseURL}/users/roles`
/**
* @description getAllRoles url链接，不包含baseURL
*/
UserController.getAllRoles.path=`/users/roles`
/**
* @description createRole url链接，包含baseURL
*/
UserController.createRole.fullPath=`${axios.defaults.baseURL}/users/roles`
/**
* @description createRole url链接，不包含baseURL
*/
UserController.createRole.path=`/users/roles`
/**
* @description getMyUserInfo url链接，包含baseURL
*/
UserController.getMyUserInfo.fullPath=`${axios.defaults.baseURL}/users/me/info`
/**
* @description getMyUserInfo url链接，不包含baseURL
*/
UserController.getMyUserInfo.path=`/users/me/info`
/**
* @description updateMyUserInfo url链接，包含baseURL
*/
UserController.updateMyUserInfo.fullPath=`${axios.defaults.baseURL}/users/me/info`
/**
* @description updateMyUserInfo url链接，不包含baseURL
*/
UserController.updateMyUserInfo.path=`/users/me/info`
/**
* @description getMyAvatar url链接，包含baseURL
*/
UserController.getMyAvatar.fullPath=`${axios.defaults.baseURL}/users/me/avatar`
/**
* @description getMyAvatar url链接，不包含baseURL
*/
UserController.getMyAvatar.path=`/users/me/avatar`
/**
* @description updateMyAvatar url链接，包含baseURL
*/
UserController.updateMyAvatar.fullPath=`${axios.defaults.baseURL}/users/me/avatar`
/**
* @description updateMyAvatar url链接，不包含baseURL
*/
UserController.updateMyAvatar.path=`/users/me/avatar`
/**
* @description getUserById url链接，包含baseURL
*/
UserController.getUserById.fullPath=`${axios.defaults.baseURL}/users/{userId}/info`
/**
* @description getUserById url链接，不包含baseURL
*/
UserController.getUserById.path=`/users/{userId}/info`
/**
* @description getUserRoles url链接，包含baseURL
*/
UserController.getUserRoles.fullPath=`${axios.defaults.baseURL}/users/{id}/roles`
/**
* @description getUserRoles url链接，不包含baseURL
*/
UserController.getUserRoles.path=`/users/{id}/roles`
/**
* @description getAvatar url链接，包含baseURL
*/
UserController.getAvatar.fullPath=`${axios.defaults.baseURL}/users/{id}/avatar`
/**
* @description getAvatar url链接，不包含baseURL
*/
UserController.getAvatar.path=`/users/{id}/avatar`
/**
* @description getMyRoles url链接，包含baseURL
*/
UserController.getMyRoles.fullPath=`${axios.defaults.baseURL}/users/me/roles`
/**
* @description getMyRoles url链接，不包含baseURL
*/
UserController.getMyRoles.path=`/users/me/roles`
/**
* @description getUsers url链接，包含baseURL
*/
UserController.getUsers.fullPath=`${axios.defaults.baseURL}/users/info`
/**
* @description getUsers url链接，不包含baseURL
*/
UserController.getUsers.path=`/users/info`
/**
* @description getUserByIds url链接，包含baseURL
*/
UserController.getUserByIds.fullPath=`${axios.defaults.baseURL}/users/batched/{userIds}/info`
/**
* @description getUserByIds url链接，不包含baseURL
*/
UserController.getUserByIds.path=`/users/batched/{userIds}/info`
/**
* @description deleteRole url链接，包含baseURL
*/
UserController.deleteRole.fullPath=`${axios.defaults.baseURL}/users/roles/{roleId}`
/**
* @description deleteRole url链接，不包含baseURL
*/
UserController.deleteRole.path=`/users/roles/{roleId}`

export class SystemController {
 
  /**
  * @summary 获取系统邮件
  * @param {String} [query] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {String} [lastkey] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSystemEmails(query,offset,pagesize,lastkey,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/emails',
        data:{},
        params:{query,offset,pagesize,lastkey},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加系统邮件
  * @param {UserModel.EmailRequest} [emailrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addEmail(emailrequest,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/emails',
        data:emailrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取系统邮件模板
  * @param {String} [before] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getEmailTemplate(before,offset,pagesize,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/emailTemplates',
        data:{},
        params:{before,offset,pagesize},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加系统邮件模板
  * @param {UserModel.AddEmailTemplateModel} [addemailtemplatemodel] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addEmailTemplate(addemailtemplatemodel,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/emailTemplates',
        data:addemailtemplatemodel,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新系统邮件模板
  * @param {String} [pathid] 
  * @param {UserModel.UpdateEmailTemplateModel} [updateemailtemplatemodel] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateEmailTemplate(pathid,updateemailtemplatemodel,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/emailTemplates/'+pathid+'',
        data:updateemailtemplatemodel,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加系统配置
  * @param {UserModel.AddWebsiteConfigDTO} [addwebsiteconfigdto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async setConfig(addwebsiteconfigdto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/config',
        data:addwebsiteconfigdto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取系统所有的状态码
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllStatusCode(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/statusCode',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取登陆系统配置
  * @param {String} [pathname] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserConfig(pathname,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/config/user/'+pathname+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取系统配置
  * @param {String} [pathname] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getPublicConfig(pathname,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/config/public/'+pathname+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取管理员系统配置
  * @param {String} [pathname] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAdminConfig(pathname,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/config/admin/'+pathname+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除系统邮件
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async delete(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/system/emails/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class SystemController static method properties bind
/**
* @description getSystemEmails url链接，包含baseURL
*/
SystemController.getSystemEmails.fullPath=`${axios.defaults.baseURL}/system/emails`
/**
* @description getSystemEmails url链接，不包含baseURL
*/
SystemController.getSystemEmails.path=`/system/emails`
/**
* @description addEmail url链接，包含baseURL
*/
SystemController.addEmail.fullPath=`${axios.defaults.baseURL}/system/emails`
/**
* @description addEmail url链接，不包含baseURL
*/
SystemController.addEmail.path=`/system/emails`
/**
* @description getEmailTemplate url链接，包含baseURL
*/
SystemController.getEmailTemplate.fullPath=`${axios.defaults.baseURL}/system/emailTemplates`
/**
* @description getEmailTemplate url链接，不包含baseURL
*/
SystemController.getEmailTemplate.path=`/system/emailTemplates`
/**
* @description addEmailTemplate url链接，包含baseURL
*/
SystemController.addEmailTemplate.fullPath=`${axios.defaults.baseURL}/system/emailTemplates`
/**
* @description addEmailTemplate url链接，不包含baseURL
*/
SystemController.addEmailTemplate.path=`/system/emailTemplates`
/**
* @description updateEmailTemplate url链接，包含baseURL
*/
SystemController.updateEmailTemplate.fullPath=`${axios.defaults.baseURL}/system/emailTemplates/{id}`
/**
* @description updateEmailTemplate url链接，不包含baseURL
*/
SystemController.updateEmailTemplate.path=`/system/emailTemplates/{id}`
/**
* @description setConfig url链接，包含baseURL
*/
SystemController.setConfig.fullPath=`${axios.defaults.baseURL}/system/config`
/**
* @description setConfig url链接，不包含baseURL
*/
SystemController.setConfig.path=`/system/config`
/**
* @description getAllStatusCode url链接，包含baseURL
*/
SystemController.getAllStatusCode.fullPath=`${axios.defaults.baseURL}/system/statusCode`
/**
* @description getAllStatusCode url链接，不包含baseURL
*/
SystemController.getAllStatusCode.path=`/system/statusCode`
/**
* @description getUserConfig url链接，包含baseURL
*/
SystemController.getUserConfig.fullPath=`${axios.defaults.baseURL}/system/config/user/{name}`
/**
* @description getUserConfig url链接，不包含baseURL
*/
SystemController.getUserConfig.path=`/system/config/user/{name}`
/**
* @description getPublicConfig url链接，包含baseURL
*/
SystemController.getPublicConfig.fullPath=`${axios.defaults.baseURL}/system/config/public/{name}`
/**
* @description getPublicConfig url链接，不包含baseURL
*/
SystemController.getPublicConfig.path=`/system/config/public/{name}`
/**
* @description getAdminConfig url链接，包含baseURL
*/
SystemController.getAdminConfig.fullPath=`${axios.defaults.baseURL}/system/config/admin/{name}`
/**
* @description getAdminConfig url链接，不包含baseURL
*/
SystemController.getAdminConfig.path=`/system/config/admin/{name}`
/**
* @description delete url链接，包含baseURL
*/
SystemController.delete.fullPath=`${axios.defaults.baseURL}/system/emails/{id}`
/**
* @description delete url链接，不包含baseURL
*/
SystemController.delete.path=`/system/emails/{id}`
