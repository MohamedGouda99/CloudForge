import requests
import json

# Login as admin using form data
login_response = requests.post('http://localhost:8000/api/auth/login', data={
    'username': 'admin',
    'password': 'admin123'
})
token = login_response.json()['access_token']
print(f'Got token: {token[:20]}...')

# Run infracost on project 8
print('\nRunning Infracost on project 8...')
response = requests.post(
    'http://localhost:8000/api/terraform/infracost/8',
    headers={'Authorization': f'Bearer {token}'},
    timeout=120
)

print(f'Status Code: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Success: {data.get("success")}')
    print(f'Total Monthly Cost: ${data.get("total_monthly_cost")}/month')
    print(f'Projects Count: {data.get("projects_count")}')

    # Show resource breakdown
    cost_output = data.get('cost_output', {})
    projects = cost_output.get('projects', [])
    if projects:
        print(f'\nResources found in Infracost:')
        for proj in projects:
            resources = proj.get('breakdown', {}).get('resources', [])
            print(f'  Total resources in project: {len(resources)}')
            for res in resources:
                print(f'  - {res.get("name")}: ${res.get("monthlyCost", "0")}/month')
else:
    print(f'Error Response:')
    print(response.text)
