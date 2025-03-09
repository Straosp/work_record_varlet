import httpRequest from './axios-config.ts';

//const TOKEN_FAILED =  401;
const SUCCESS =  200;

export interface HttpResult<T> {
    code: number;
    message: string;
    data: T;
}
export interface ErrorMessage {
    code: number;
    message: string;
}
export interface RequestConfig<T> {
    params?: any;
    onSuccess: (data?: T) => void;
    onFailure: (error?: ErrorMessage) => void;
}
export interface RequestNoResultConfig {
    params?: any;
    onSuccess: () => void;
    onFailure: (error: ErrorMessage) => void;
}

export async function getRequest<T>(url:string, requestConfig?: RequestConfig<T>) {
    const response = await httpRequest.get<HttpResult<T>>(url, { params: requestConfig?.params });
    if (response.data.code === SUCCESS){
        let httpResult: HttpResult<T> = response.data;
        if (httpResult.code === SUCCESS) {
            requestConfig?.onSuccess(httpResult?.data)
        }else {
            requestConfig?.onFailure({
                code: httpResult.code,
                message: httpResult.message,
            });
        }
    }else {
        requestConfig?.onFailure({
            code: response.data.code,
            message: response.data.message,
        });
    }
}
export async function postRequestNoResult(url: string, requestConfig?: RequestNoResultConfig){
    const response = await httpRequest.post<HttpResult<any>>(url, requestConfig?.params);
    if (response.data.code === SUCCESS){
        let httpResult: HttpResult<any> = response.data;
        if (httpResult.code === SUCCESS) {
            requestConfig?.onSuccess()
        }else {
            requestConfig?.onFailure({
                code: httpResult.code,
                message: httpResult.message,
            });
        }
    }else {
        requestConfig?.onFailure({
            code: response.data.code,
            message: response.data.message,
        });
    }
}
export async function postRequest<T>(url: string, requestConfig?: RequestConfig<T>){
    const response = await httpRequest.post<HttpResult<T>>(url, requestConfig?.params);
    if (response.data.code === SUCCESS){
        let httpResult: HttpResult<T> = response.data;
        if (httpResult.code === SUCCESS) {
            requestConfig?.onSuccess(response.data.data)
        }else {
            requestConfig?.onFailure({
                code: httpResult.code,
                message: httpResult.message,
            });
        }
    }else {
        requestConfig?.onFailure({
            code: response.data.code,
            message: response.data.message,
        });
    }
}

export async function putRequest(url: string, requestConfig?:RequestNoResultConfig){
    const response = await httpRequest.put<HttpResult<any>>(url, requestConfig?.params);
    if (response.data.code === SUCCESS){
        let httpResult: HttpResult<any> = response.data;
        if (httpResult.code === SUCCESS) {
            requestConfig?.onSuccess()
        }else {
            requestConfig?.onFailure({
                code: httpResult.code,
                message: httpResult.message,
            });
        }
    }else {
        requestConfig?.onFailure({
            code: response.data.code,
            message: response.data.message,
        });
    }
}

export async function delRequest(url: string, requestConfig?:RequestNoResultConfig){
    const response = await httpRequest.delete<HttpResult<any>>(url, requestConfig?.params);
    if (response.data.code === SUCCESS){
        let httpResult: HttpResult<any> = response.data;
        if (httpResult.code === SUCCESS) {
            requestConfig?.onSuccess()
        }else {
            requestConfig?.onFailure({
                code: httpResult.code,
                message: httpResult.message,
            });
        }
    }else {
        requestConfig?.onFailure({
            code: response.data.code,
            message: response.data.message,
        });
    }
}

