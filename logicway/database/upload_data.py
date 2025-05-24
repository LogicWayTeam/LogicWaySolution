import os
import requests
import zipfile
import git

url = "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile"
headers = {
    "Accept": "application/octet-stream",
    "Content-Type": "application/x-www-form-urlencoded",
}

if os.getenv("SSH") == "1":
    storage_url = 'git@github.com:LogicWayTeam/PoznanGTFS.git'
else:
    storage_url = 'https://github.com/LogicWayTeam/PoznanGTFS.git'


base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

version_file = os.path.join(base_dir, 'version.txt')

zip_file = os.path.join(base_dir, "ZTMPoznanGTFS.zip")
data_dir = os.path.join(base_dir, "ZTMPoznanGTFS")


#########################################################


def is_git_repository(directory):
    return os.path.isdir(os.path.join(directory, '.git'))


#########################################################


def update_internal_storage():
    response = requests.head(url, headers=headers)

    if response.status_code == 200:
        repo = download_from_internal_storage()

        download_from_external_storage()
        unzip_data()
        delete_zip()

        if repo.is_dirty():
            if os.path.exists(version_file):
                with open(version_file, 'r') as file:
                    current_version = file.read().strip()

                major, minor, patch = map(int, current_version.split('.'))
                patch += 1
                new_version = f"{major}.{minor}.{patch}"
            else:
                new_version = "1.0.0"

            with open(version_file, 'w') as file:
                file.write(new_version)

            try:
                repo.git.add(A=True)
                repo.index.commit(new_version)
                origin = repo.remote(name='origin')
                origin.push()
                print("New version has been pushed into internal storage.")
            except Exception as e:
                print("Git error:", e)
        else:
            print("No changes in the data.")
    else:
        print(f"Failed to retrieve data from external storage, status: {response.status_code}")


def download_from_internal_storage():
    if not os.path.exists(base_dir):
        repo = git.Repo.clone_from(storage_url, base_dir)
        print("Data from internal storage has been cloned.")
    else:
        repo = git.Repo(base_dir)
        if repo.remotes.origin:
            repo.remotes.origin.fetch(prune=True)
            print("Data from internal storage has been updated.")

    return repo


def download_from_external_storage():
    response = requests.get(url, headers=headers, stream=True)
    if response.status_code == 200:
        with open(zip_file, "wb") as f:
            f.write(response.content)
        print(f"Zip-data has been saved: {zip_file}")
    else:
        print(f"Error when downloading a file, status: {response.status_code}")


#########################################################


def unzip_data():
    try:
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(data_dir)
            print(f"Zip-data has been successfully extracted to: {data_dir}")
    except Exception as e:
        print(f"Error when unpacking a zip-data: {e}")


def delete_zip():
    try:
        os.remove(zip_file)
        print(f"Zip-data deleted: {zip_file}")
    except Exception as e:
        print(f"Error when deleting: {e}")


#########################################################


if __name__ == "__main__":
    if os.getenv("INTERNAL") == "1":
        download_from_internal_storage()
    else:
        update_internal_storage()
