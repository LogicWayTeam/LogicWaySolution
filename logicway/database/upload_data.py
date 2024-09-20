import os
import requests
import zipfile
import hashlib

url = "https://www.ztm.poznan.pl/en/dla-deweloperow/getGTFSFile"
headers = {
    "Accept": "application/octet-stream",
    "Content-Type": "application/x-www-form-urlencoded",
}

base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

os.makedirs(base_dir, exist_ok=True)

zip_file = os.path.join(base_dir, "ZTMPoznanGTFS.zip")
data_dir = os.path.join(base_dir, "ZTMPoznanGTFS")
checksum_file = os.path.join(base_dir, "checksum.txt")

#########################################################


def calculate_checksum(file_path, algorithm='sha256'):
    hash_algo = hashlib.new(algorithm)
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_algo.update(chunk)
    return hash_algo.hexdigest()


def get_saved_checksum():
    if os.path.exists(checksum_file):
        with open(checksum_file, "r") as f:
            return f.read().strip()
    return None


def save_checksum(checksum):
    with open(checksum_file, "w") as f:
        f.write(checksum)

#########################################################


def check_and_download():
    response = requests.head(url, headers=headers)

    if response.status_code == 200:
        download_file()
        
        new_checksum = calculate_checksum(zip_file)
        saved_checksum = get_saved_checksum()

        if saved_checksum != new_checksum:
            print("Zip-data has been updated, save the new version.")
            unzip_data()
            save_checksum(new_checksum)
        else:
            print("Zip-data is up to date, no download required.")

        delete_zip()
    else:
        print(f"Failed to retrieve zip-data, status: {response.status_code}")


def download_file():
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
    check_and_download()