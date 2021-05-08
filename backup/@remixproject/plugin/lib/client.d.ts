/// <reference types="node" />
import { EventEmitter } from 'events';
import { RemixApi } from '@remixproject/plugin-api';
import { GetPluginService, Profile } from '@remixproject/plugin-utils';
import type { Api, PluginRequest, ApiMap, EventKey, EventCallback, MethodParams, MethodKey, EventParams, ProfileMap, IPluginService, PluginBase } from '@remixproject/plugin-utils';
export interface PluginDevMode {
    /** Port for localhost */
    port: number | string;
    origins: string | string[];
}
/** Options of the plugin client */
export interface PluginOptions<T extends ApiMap> {
    customTheme: boolean;
    /** define a set of custom apis to implements on the client  */
    customApi: ProfileMap<T>;
    /**
     * Allow a set of origins
     * You can either a list of origin or a url with a link of origins
     */
    allowOrigins: string | string[];
    /**
     * options only available for dev mode
     * @deprecated use allowOrigins instead if you want to limit the parent origin
     */
    devMode: Partial<PluginDevMode>;
}
export declare const defaultOptions: Partial<PluginOptions<any>>;
/** Throw an error if client try to send a message before connection */
export declare function handleConnectionError(devMode?: Partial<PluginDevMode>): void;
export declare class PluginClient<T extends Api = any, App extends ApiMap = RemixApi> implements PluginBase<T, App> {
    private id;
    isLoaded: boolean;
    events: EventEmitter;
    currentRequest: PluginRequest;
    options: PluginOptions<App>;
    name: string;
    methods: string[];
    activateService: Record<string, () => Promise<any>>;
    onActivation?(): void;
    constructor(options?: Partial<PluginOptions<App>>);
    onload(cb?: () => void): Promise<void>;
    /**
     * Ask the plugin manager if current request can call a specific method
     * @param method The method to call
     * @param message An optional message to show to the user
     */
    askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean>;
    /**
     * Called before deactivating the plugin
     * @param from profile of plugin asking to deactivate
     * @note PluginManager will always be able to deactivate
     */
    canDeactivate(from: Profile): boolean;
    /** Make a call to another plugin */
    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<ReturnType<App[Name]['methods'][Key]>>;
    /** Listen on event from another plugin */
    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
    /** Listen once on event from another plugin */
    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
    /** Remove all listeners on an event from an external plugin */
    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
    /** Expose an event for the IDE */
    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
    /**
     * Create a service under the client node
     * @param name The name of the service
     * @param service The service
     */
    createService<S extends Record<string, any>, Service extends IPluginService<S>>(name: string, service: Service): Promise<GetPluginService<Service>>;
    /**
     * Prepare a service to be lazy loaded
     * @param name The name of the subservice inside this service
     * @param factory A function to create the service on demand
     */
    prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>>;
}