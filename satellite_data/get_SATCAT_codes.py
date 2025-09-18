import re
import csv

with open("SATCAT_country.txt") as f:

    li_ar = f.readlines()

    new_ar = [re.findall(">([A-Z].+?)<", i) for i in li_ar]
    print(new_ar)

    with open("SATCAT.csv", "w") as fi:
        csv.writer(fi).writerows(new_ar)
