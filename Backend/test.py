import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient
from faker import Faker
import json
from bcrypt import hashpw, gensalt


fake = Faker()

with open('data/grades.json') as f:
    grades = json.load(f)

with open('data/skills.json') as f:
    skills = json.load(f)

MONGO_URL = "mongodb://localhost:27017/"
client = AsyncIOMotorClient(MONGO_URL)
db = client.data
users_collection = db.users
projects_collection = db.projects

async def create_random_users(count=20):
    users = []
    for _ in range(count):
        username = fake.user_name()
        mail = fake.email()
        
        password = fake.password(length=12)
        hashed_password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')
        bio = fake.text(max_nb_chars=random.randint(60, 120))
        selected_grade = random.choice(grades['grades'])

        selected_skills = random.sample(skills['skills'], k=random.randint(4, 20))
        user_services = ['GitHub'] if random.choice([True, False]) else []

        user = {
            "username": username,
            "mail": mail,
            "password": hashed_password,
            "bio": bio,
            "selectedGrade": selected_grade,
            "selectedSkills": selected_skills,
        }

        if user_services:
            user["services"] = user_services
        
        users.append(user)

    await users_collection.insert_many(users)
    print(f"Успешно создано {count} случайных пользователей")

async def create_projects_for_users():
    users = await users_collection.find({}, {"username": 1}).to_list(length=None)
    
    if not users:
        print("Нет пользователей в базе данных")
        return

    for user in users:
        project_name = fake.catch_phrase()
        project_description = fake.text(max_nb_chars=200)
        
        project_skills = random.sample(
            skills['skills'], 
            k=random.randint(5, min(20, len(skills['skills'])))
        )
        project_members = random.choices(
            grades['grades'], 
            k=random.randint(1, 5)
        )

        time_to_start = str(random.randint(1, 12))
        time_to_complete = str(random.randint(1, 12))

        project = {
            "name": project_name,
            "description": project_description,
            "skills": project_skills,
            "members": project_members,
            "time_to_start": time_to_start,
            "time_to_complete": time_to_complete,
            "author": user["username"]
        }
        
        result = await projects_collection.insert_one(project)
        project_id = result.inserted_id

        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$addToSet": {"projects": project_name}},
            upsert=True
        )
        
        print(f"Создан проект '{project_name}' для пользователя {user['username']}")

async def main():
    # await create_random_users()
    await create_projects_for_users()

if __name__ == "__main__":
    asyncio.run(main())