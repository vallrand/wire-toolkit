import { encodeURLQuery, decodeURLQuery } from '../../lib/common/url'

it('encodes URL query', function(){
    expect(encodeURLQuery({
        paramA: 'value-a',
        paramB: 'value b+',
        paramC: null
    })).toEqual('paramA=value-a&paramB=value%20b%2B')
})

it('decodes URL query', function(){
    expect(decodeURLQuery('https://example.com/search?paramA=value-a&paramB=value%20b%2B'))
    .toEqual({
        paramA: 'value-a',
        paramB: 'value b+',
    })
})