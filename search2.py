import urllib.request, urllib.parse, re
url = 'https://html.duckduckgo.com/html/'
q = 'how to create a google cloud oauth client and configure the consent screen using curl internal API clientauthconfig'
data = urllib.parse.urlencode({'q': q}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
results = re.findall(r'<a class=.result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
for i, r in enumerate(results):
    clean = re.sub(r'<[^>]+>', '', r).strip()
    print((str(i+1) + '. ' + clean).encode('ascii', 'ignore').decode('ascii'))
