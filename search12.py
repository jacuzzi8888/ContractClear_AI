import urllib.request, urllib.parse, re
url = 'https://html.duckduckgo.com/html/'
def search(q):
    data = urllib.parse.urlencode({'q': q}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        results = re.findall(r'<a class=.result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
        for i, r in enumerate(results):
            clean = re.sub(r'<[^>]+>', '', r).strip()
            print((str(i+1) + '. ' + clean).encode('ascii', 'ignore').decode('ascii'))
    except Exception as e:
        print('Error', e)

print('SEARCH 1:')
search('create google cloud oauth client consent screen "gcloud" OR "curl"')

print('\nSEARCH 2:')
search('"internal Google APIs" OR "clientauthconfig" curl web client ID consent screen')

print('\nSEARCH 3:')
search('gcloud alpha iap oauth-brands create consent screen')
