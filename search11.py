import urllib.request, urllib.parse, json, re
url = 'https://html.duckduckgo.com/html/'
q = 'how to create a google cloud oauth client and configure the consent screen using gcloud or curl'
data = urllib.parse.urlencode({'q': q}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    results = re.findall(r'<a class=\"result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
    for i, r in enumerate(results):
        print(f'{i+1}. {re.sub(r\"<[^>]+>\", \"\", r).strip()}'.encode('ascii', 'ignore').decode('ascii'))
except Exception as e:
    pass

q2 = 'curl internal Google API to configure OAuth consent screen and create web client ID'
data = urllib.parse.urlencode({'q': q2}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    results = re.findall(r'<a class=\"result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
    print('\nSearch 2:\n')
    for i, r in enumerate(results):
        print(f'{i+1}. {re.sub(r\"<[^>]+>\", \"\", r).strip()}'.encode('ascii', 'ignore').decode('ascii'))
except Exception as e:
    pass
