import requests
import json

# Login
login_response = requests.post('http://localhost:8000/api/auth/login', data={
    'username': 'admin',
    'password': 'admin123'
})
token = login_response.json()['access_token']

# Run infracost on project 5
print('Running Infracost on project 5...')
response = requests.post(
    'http://localhost:8000/api/terraform/infracost/5',
    headers={'Authorization': f'Bearer {token}'},
    timeout=120
)

if response.status_code == 200:
    data = response.json()
    print(f'\nSuccess: {data.get("success")}')
    print(f'Total Monthly Cost: ${data.get("total_monthly_cost")}/month')

    cost_output = data.get('cost_output', {})
    projects = cost_output.get('projects', [])
    if projects:
        print(f'\nResources detected by Infracost:')
        for proj in projects:
            resources = proj.get('breakdown', {}).get('resources', [])
            print(f'  Total resources: {len(resources)}')
            for res in resources:
                print(f'  - {res.get("name")}: ${res.get("monthlyCost", "0")}/month')
else:
    print(f'Error {response.status_code}: {response.text}')
