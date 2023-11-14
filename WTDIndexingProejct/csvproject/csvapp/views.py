from django.shortcuts import render
from django.http import JsonResponse
import numpy as np
import pandas as pd
import requests
import io
from fuzzywuzzy import fuzz

CSV_URL = "https://raw.githubusercontent.com/brlehman/bcdhprojectslab/main/WTDIndexingProejct/TDnameIndex.csv"

def create_result_dict(row):
    return {
        "Modern Name": row["modernName"],
        "Alternative Name": row["alternativeNames"],
        "State/Province/Country": f"{row['state']}, {row['country']}"
    }
# get data from the CSV URL and return it as a DataFrame but filter out some columns
# from modernName,alternativeNames,state,country,latitude,longitude,ID,Type,AltID, only keep modernName,alternativeNames,AltScript,state,country
def fetch_csv_data():
    csv_data = requests.get(CSV_URL).content
    data = pd.read_csv(io.StringIO(csv_data.decode('utf-8')))
    data = data[["modernName", "alternativeNames", "state", "country"]]

    # Convert NaN values to None
    data = data.where(pd.notnull(data), None)

    return data



# get the data for a specific starting letter (A-Z) by the column "modernName"
# used for the "Browse by Letter" feature
# if modernName is empty, fill it; if the parameter is lowercase, uppercase it
def get_indexed_data(request, letter):
    data = fetch_csv_data()
    # Ensure the modernName column has no NaN values
    data['modernName'] = data['modernName'].fillna('')
    letter = letter.upper()
    # Now apply the condition
    filtered_data = data.loc[data['modernName'].str.startswith(
        letter)]
    results = []
    for _, row in filtered_data.iterrows():
        results = [create_result_dict(row) for _, row in filtered_data.iterrows()]
    return JsonResponse(results, safe=False)


# search the data for a specific search term across all columns: modernName", "alternativeNames", "state", "country"
# todo: adding contain such as we don't only rely on fuzz ratio
def search_data(request, term):
    data = fetch_csv_data()
    results = []
    # Ensure all columns have no NaN values
    data = data.fillna('')
    for _, row in data.iterrows():
        if any(fuzz.ratio(term, str(value)) > 75 for value in row.values):  # 75 is a similarity threshold
            results = [create_result_dict(row) for _, row in data.iterrows() if any(fuzz.ratio(term, str(value)) > 75 for value in row.values)]
    return JsonResponse(results, safe=False)


# return all filtered data as JSON
# call fetch_csv_data() to get all data and convert it to JSON
def get_all_data(request):
    data = fetch_csv_data()
    results = [create_result_dict(row) for _, row in data.iterrows()]
    return JsonResponse(results, safe=False)


def homePageView(request):
    return JsonResponse({"message": "Hello, world!"})


# views.py


def handler404(request, exception):
    return render(request, '404.html', status=404)
