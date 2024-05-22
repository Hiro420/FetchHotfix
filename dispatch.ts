/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface Dispatch {
  retcode: number;
  msg: string;
  topSeverRegionName: string;
  regionList: Dispatch_Region[];
  stopDesc: string;
}

export interface Dispatch_Region {
  name: string;
  title: string;
  dispatchUrl: string;
  env: string;
  displayName: string;
  msg: string;
}

function createBaseDispatch(): Dispatch {
  return { retcode: 0, msg: "", topSeverRegionName: "", regionList: [], stopDesc: "" };
}

export const Dispatch = {
  encode(message: Dispatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.retcode !== 0) {
      writer.uint32(8).uint32(message.retcode);
    }
    if (message.msg !== "") {
      writer.uint32(18).string(message.msg);
    }
    if (message.topSeverRegionName !== "") {
      writer.uint32(26).string(message.topSeverRegionName);
    }
    for (const v of message.regionList) {
      Dispatch_Region.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.stopDesc !== "") {
      writer.uint32(42).string(message.stopDesc);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Dispatch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDispatch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.retcode = reader.uint32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.msg = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.topSeverRegionName = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.regionList.push(Dispatch_Region.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.stopDesc = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Dispatch {
    return {
      retcode: isSet(object.retcode) ? globalThis.Number(object.retcode) : 0,
      msg: isSet(object.msg) ? globalThis.String(object.msg) : "",
      topSeverRegionName: isSet(object.topSeverRegionName) ? globalThis.String(object.topSeverRegionName) : "",
      regionList: globalThis.Array.isArray(object?.regionList)
        ? object.regionList.map((e: any) => Dispatch_Region.fromJSON(e))
        : [],
      stopDesc: isSet(object.stopDesc) ? globalThis.String(object.stopDesc) : "",
    };
  },

  toJSON(message: Dispatch): unknown {
    const obj: any = {};
    if (message.retcode !== 0) {
      obj.retcode = Math.round(message.retcode);
    }
    if (message.msg !== "") {
      obj.msg = message.msg;
    }
    if (message.topSeverRegionName !== "") {
      obj.topSeverRegionName = message.topSeverRegionName;
    }
    if (message.regionList?.length) {
      obj.regionList = message.regionList.map((e) => Dispatch_Region.toJSON(e));
    }
    if (message.stopDesc !== "") {
      obj.stopDesc = message.stopDesc;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Dispatch>, I>>(base?: I): Dispatch {
    return Dispatch.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Dispatch>, I>>(object: I): Dispatch {
    const message = createBaseDispatch();
    message.retcode = object.retcode ?? 0;
    message.msg = object.msg ?? "";
    message.topSeverRegionName = object.topSeverRegionName ?? "";
    message.regionList = object.regionList?.map((e) => Dispatch_Region.fromPartial(e)) || [];
    message.stopDesc = object.stopDesc ?? "";
    return message;
  },
};

function createBaseDispatch_Region(): Dispatch_Region {
  return { name: "", title: "", dispatchUrl: "", env: "", displayName: "", msg: "" };
}

export const Dispatch_Region = {
  encode(message: Dispatch_Region, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.dispatchUrl !== "") {
      writer.uint32(26).string(message.dispatchUrl);
    }
    if (message.env !== "") {
      writer.uint32(34).string(message.env);
    }
    if (message.displayName !== "") {
      writer.uint32(42).string(message.displayName);
    }
    if (message.msg !== "") {
      writer.uint32(50).string(message.msg);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Dispatch_Region {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDispatch_Region();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.dispatchUrl = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.env = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.displayName = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.msg = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Dispatch_Region {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      title: isSet(object.title) ? globalThis.String(object.title) : "",
      dispatchUrl: isSet(object.dispatchUrl) ? globalThis.String(object.dispatchUrl) : "",
      env: isSet(object.env) ? globalThis.String(object.env) : "",
      displayName: isSet(object.displayName) ? globalThis.String(object.displayName) : "",
      msg: isSet(object.msg) ? globalThis.String(object.msg) : "",
    };
  },

  toJSON(message: Dispatch_Region): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.title !== "") {
      obj.title = message.title;
    }
    if (message.dispatchUrl !== "") {
      obj.dispatchUrl = message.dispatchUrl;
    }
    if (message.env !== "") {
      obj.env = message.env;
    }
    if (message.displayName !== "") {
      obj.displayName = message.displayName;
    }
    if (message.msg !== "") {
      obj.msg = message.msg;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Dispatch_Region>, I>>(base?: I): Dispatch_Region {
    return Dispatch_Region.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Dispatch_Region>, I>>(object: I): Dispatch_Region {
    const message = createBaseDispatch_Region();
    message.name = object.name ?? "";
    message.title = object.title ?? "";
    message.dispatchUrl = object.dispatchUrl ?? "";
    message.env = object.env ?? "";
    message.displayName = object.displayName ?? "";
    message.msg = object.msg ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}