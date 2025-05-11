## Database App

### Upload Data Locally for Database and Sync with [Local Storage](https://github.com/LogicWayTeam/PoznanGTFS)

```bash
python upload_data.py
```
or push using SSH 
```bash
SSH=1 python upload_data.py
```

To upload data to the internal storage, use the following command:

```bash
INTERNAL=1 python upload_data.py
```

### Load Data to Database

```bash
python load_data.py
```