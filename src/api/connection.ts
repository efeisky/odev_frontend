export interface ApiResponse<T = unknown> {
  status: boolean
  message: string
  data?: T
}

export class APIConnection {
  private static instance: APIConnection
  private baseURL: string
  private defaultHeaders: HeadersInit

  private constructor(
    baseURL: string = "http://localhost:8000",
    defaultHeaders: HeadersInit = { "Content-Type": "application/json" }
  ) {
    this.baseURL = baseURL
    this.defaultHeaders = defaultHeaders
  }

  public static getInstance(): APIConnection {
    if (!APIConnection.instance) {
      APIConnection.instance = new APIConnection()
    }
    return APIConnection.instance
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      headers: this.defaultHeaders,
      ...options,
    })

    let json: unknown
    try {
      json = await response.json()
    } catch {
      throw new Error("Sunucudan geçerli JSON yanıtı alınamadı.")
    }

    if (
      typeof json !== "object" ||
      json === null ||
      !("status" in json) ||
      typeof (json as any).status !== "boolean"
    ) {
      throw new Error("Sunucu yanıtı beklenen formatta değil (status: boolean eksik).")
    }

    return json as ApiResponse<T>
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      endpoint += `?${query}`;
    }

    return this.request<T>(endpoint, { method: "GET"});
  }

  public async auth<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      endpoint += `?${query}`;
    }

    return this.request<T>(endpoint, { method: "GET", credentials: "include"});
  }

  public async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  public async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  public async delete<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: "DELETE", 
      body: JSON.stringify(data) 
    })
  }

  public setHeader(key: string, value: string) {
    this.defaultHeaders = { ...this.defaultHeaders, [key]: value }
  }
}