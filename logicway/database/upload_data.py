import os
import requests
import zipfile
import git
import codecs
import glob

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
# BOM Character Reducer Functions
#########################################################

def remove_bom_from_file(file_path):
    """
    Remove BOM characters from a file
    
    Args:
        file_path (str): Path to the file
        
    Returns:
        bool: True if BOM was removed, False if no BOM found
    """
    try:
        with open(file_path, 'rb') as file:
            content = file.read()
        
        # Check for different types of BOM
        bom_removed = False
        original_encoding = None
        
        if content.startswith(codecs.BOM_UTF8):
            content = content[len(codecs.BOM_UTF8):]
            original_encoding = 'utf-8'
            bom_removed = True
        elif content.startswith(codecs.BOM_UTF16_LE):
            content = content[len(codecs.BOM_UTF16_LE):]
            original_encoding = 'utf-16-le'
            bom_removed = True
        elif content.startswith(codecs.BOM_UTF16_BE):
            content = content[len(codecs.BOM_UTF16_BE):]
            original_encoding = 'utf-16-be'
            bom_removed = True
        elif content.startswith(codecs.BOM_UTF32_LE):
            content = content[len(codecs.BOM_UTF32_LE):]
            original_encoding = 'utf-32-le'
            bom_removed = True
        elif content.startswith(codecs.BOM_UTF32_BE):
            content = content[len(codecs.BOM_UTF32_BE):]
            original_encoding = 'utf-32-be'
            bom_removed = True
        
        if bom_removed:
            # Write back the content without BOM
            with open(file_path, 'wb') as file:
                file.write(content)
            print(f"BOM removed from file: {file_path} (was {original_encoding})")
        
        return bom_removed
        
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
        return False


def process_gtfs_files_for_bom(directory):
    """
    Process all GTFS text files in a directory to remove BOM characters
    
    Args:
        directory (str): Directory containing GTFS files
    """
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return
    
    # GTFS file extensions and patterns
    gtfs_patterns = [
        "*.txt",  # Standard GTFS files
        "*.csv",  # CSV files
        "*.tsv",  # Tab-separated files
    ]
    
    files_processed = 0
    bom_files_found = 0
    
    print("Processing GTFS files for BOM removal...")
    
    for pattern in gtfs_patterns:
        pattern_path = os.path.join(directory, "**", pattern)
        for file_path in glob.glob(pattern_path, recursive=True):
            files_processed += 1
            if remove_bom_from_file(file_path):
                bom_files_found += 1
    
    print(f"BOM processing completed: {files_processed} files processed, {bom_files_found} files had BOM removed")


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
        
        # Process extracted files for BOM removal
        process_gtfs_files_for_bom(data_dir)
        
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
