import re
from . import projects_collection, users_collection

async def create_project(data: dict, username: str):
    existing_project = await projects_collection.find_one({'name': data['name']})
    if existing_project:
        return {'error': 'Project with the same name already exists!'}

    data.update({"author": username})
    result = await projects_collection.insert_one(data)

    await users_collection.update_one(
        {"username": username},
        {"$addToSet": {"projects": data['name']}}
    )

    return {
        'message': 'Project has been created!',
        'project_id': str(result.inserted_id)
    }

async def get_projects():
    projects = []
    async for project in projects_collection.find():
        project["_id"] = str(project["_id"])
        projects.append(project)
    return projects

async def get_projects_by_name(name: str):
    regex = re.compile(f'.*{re.escape(name)}.*', re.IGNORECASE)
    projects = await projects_collection.find({'name': {'$regex': regex}}).to_list(length=100)
    if not projects:
        return {'error': "No projects found with this name!"}
    for project in projects:
        project['_id'] = str(project['_id'])
    return {'projects': projects[::-1]}

async def get_paginated_projects(page_number: int, page_size: int):
    skip_count = (page_number - 1) * page_size
    cursor = projects_collection.find().sort([("_id", -1)]).skip(skip_count).limit(page_size)
    projects = await cursor.to_list(length=None)
    for project in projects:
        project['_id'] = str(project['_id'])

    total_projects = await projects_collection.count_documents({})
    return {
        "projects": projects,
        "pagination": {
            "total": total_projects,
            "page": page_number,
            "page_size": page_size,
            "total_pages": (total_projects + page_size - 1) // page_size
        }
    }
