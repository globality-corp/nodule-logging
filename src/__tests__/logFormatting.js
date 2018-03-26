import { extractLoggingProperties, getCleanStackTrace, getParentFunction } from '../logFormatting';

function b(req) { return getCleanStackTrace(req); }
function a(req) { return b(req); }
function c(req) { return getParentFunction(req); }
function d(req) { return c(req); }


const uuidList = ['48df0785-dc66-408c-be85-718e5da94e10', 'b0a68c90-7f21-45e3-b694-323ec588de8c'];

const req = {
    string: 'string',
    uuidList,
    stringWithNumberValue: 0,
    sub: {
        string: '123',
        uuid: 'a0a68c90-7f21-45e3-b694-323ec588de8c',
        uuidWithStringValue: 'xxx68c90-7f21-45e3-b694-323ec588de8c',
        uuidWithNumberValue: 0,
    },
    reString: 'query hi(',
    reStringWithNoMatch: 'query hi',
    sub2: {
        number: 1,
    },
    sub3: {
        hiddenNumber: 1,
    },
    url: 'https://company.com/user/48df0785-dc66-408c-be85-718e5da94e10/role/48df0785-dc66-408c-be85-718e5da94e10?x=y',
    app: {
        config: {
            logging: {
                stackTracePathFilter: ['/logFormatting.js'],
            },
        },
    },
};

const rules = [
    { path: 'string', name: 'string', type: 'string' },
    { path: 'uuidList', name: 'uuidList', type: 'uuidList' },
    { path: 'uuidList', name: 'uuidListAsUuid', type: 'uuid' },
    { path: 'sub.string', name: 'subString', type: 'string' },
    { path: 'sub.uuid', name: 'subUuid', type: 'uuid' },
    { path: 'reString', name: 'reString', type: 'string', filterPattern: 'query ([^\\(]*)\\(' },
    { path: 'sub2', name: 'sub2', type: 'number', subPaths: ['number'] },
    { path: 'sub3', name: 'sub3', type: 'number' },
    { path: 'url', name: 'url', type: 'string', hideUUID: true },
];

const rulesX = [
    { path: 'stringWithNumberValue', name: 'stringWithNumberValue', type: 'string' },
    { path: 'sub.uuidWithStringValue', name: 'subUuidWithStringValue', type: 'uuid' },
    { path: 'sub.uuidWithNumberValue', name: 'subUuidWithNumberValue', type: 'uuid' },
    { path: 'reStringWithNoMatch', name: 'reStringWithNoMatch', type: 'string', filterPattern: 'query ([^\\(]*)\\(' },
    { path: 'sub2', name: 'number', type: 'number', subPaths: ['qx'] },
];

describe('calculateUserStatus', () => {
    it('should find the right function`s names', async () => {
        const stackTrace = a(req);
        expect(stackTrace[0][0]).toEqual('b');
        expect(stackTrace[0][1]).toEqual('/logFormatting.js:3:26');
        expect(stackTrace[1][0]).toEqual('a');
    });

    it('should find the right parent name', async () => {
        const parent = d(req);
        expect(parent.functionName).toEqual('d');
    });

    it('should find the right parameters', async () => {
        const params = extractLoggingProperties(req, rules);
        expect(params.string).toEqual('string');
        expect(params.uuidList).toEqual(uuidList);
        expect(params.uuidListAsUuid).toEqual(undefined);
        expect(params.subString).toEqual('123');
        expect(params.subUuid).toEqual('a0a68c90-7f21-45e3-b694-323ec588de8c');
        expect(params.reString).toEqual('hi');
        expect(params.sub2number).toEqual(1);
        expect(params.sub3hiddenNumber).toEqual(1);
        expect(params.url).toEqual('https://company.com/user/{uuid}/role/{uuid}?x=y');
    });

    it('should ignore non relevant parameters', async () => {
        const params = extractLoggingProperties(req, rulesX);
        expect(params.stringWithNumberValue).toEqual(undefined);
        expect(params.subUuidWithStringValue).toEqual(undefined);
        expect(params.subUuidWithNumberValue).toEqual(undefined);
        expect(params.reStringWithNoMatch).toEqual(undefined);
        expect(params.sub2number).toEqual(undefined);
    });
});
