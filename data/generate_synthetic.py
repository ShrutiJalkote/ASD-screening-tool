"""
Generates a synthetic dataset that mimics the real UCI/Kaggle
"Autism Screening on Adults" dataset schema so you can build and test
the full pipeline before plugging in the real CSV.

Real dataset (use this for your final submission, not this synthetic one):
  Kaggle: "Autism Screening Adult" / "Autism Prediction"
  https://www.kaggle.com/datasets/faizunnabi/autism-screening

Schema (AQ-10 based):
  A1_Score ... A10_Score : 0/1 answers to 10 behavioral screening questions
  age                    : respondent age
  gender                 : m/f
  ethnicity              : categorical
  jaundice               : yes/no (born with jaundice)
  austim                 : yes/no (family member with autism)  [sic - typo in real dataset]
  contry_of_res          : country
  used_app_before        : yes/no
  result                 : raw AQ-10 score (sum of A1-A10, roughly)
  age_desc               : age category text
  relation               : who filled the form
  Class/ASD              : YES/NO  <-- target label
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 800

genders = np.random.choice(["m", "f"], N)
ethnicities = np.random.choice(
    ["White-European", "Asian", "Black", "Middle Eastern", "South Asian",
     "Hispanic", "Others", "Latino", "Pasifika", "Turkish"], N
)
countries = np.random.choice(
    ["United States", "India", "United Kingdom", "New Zealand", "Australia",
     "Canada", "UAE", "Jordan", "Brazil"], N
)
relations = np.random.choice(["Self", "Parent", "Relative", "Health care professional"], N)

jaundice = np.random.choice(["yes", "no"], N, p=[0.15, 0.85])
family_autism = np.random.choice(["yes", "no"], N, p=[0.12, 0.88])
used_app_before = np.random.choice(["yes", "no"], N, p=[0.05, 0.95])
age = np.clip(np.random.normal(29, 9, N).astype(int), 4, 64)
age_desc = np.array(["18 and more"] * N)

# Underlying "true" propensity — some questions are more informative than others
# to mimic real behavioral screening signal (not a single leaking feature)
base_propensity = (
    0.35 * (family_autism == "yes").astype(int)
    + 0.15 * (jaundice == "yes").astype(int)
    + np.random.normal(0, 0.5, N)
)

A_scores = {}
for i in range(1, 11):
    # each question correlates weakly-to-moderately with the propensity, plus noise
    weight = np.random.uniform(0.2, 0.6)
    noise = np.random.normal(0, 1, N)
    logit = base_propensity * weight + noise
    prob = 1 / (1 + np.exp(-logit))
    A_scores[f"A{i}_Score"] = (np.random.rand(N) < prob).astype(int)

df = pd.DataFrame(A_scores)
result = df.sum(axis=1)

final_logit = base_propensity * 1.2 + (result - result.mean()) / result.std() * 1.5
final_prob = 1 / (1 + np.exp(-final_logit))
label = (np.random.rand(N) < final_prob).astype(int)

df["age"] = age
df["gender"] = genders
df["ethnicity"] = ethnicities
df["jaundice"] = jaundice
df["austim"] = family_autism
df["contry_of_res"] = countries
df["used_app_before"] = used_app_before
df["result"] = result
df["age_desc"] = age_desc
df["relation"] = relations
df["Class/ASD"] = np.where(label == 1, "YES", "NO")

# introduce a few missing values, like the real dataset has
for col in ["ethnicity", "relation", "age"]:
    idx = np.random.choice(N, size=int(N * 0.03), replace=False)
    df.loc[idx, col] = np.nan

df.to_csv("/home/claude/asd-detection/data/autism_screening.csv", index=False)
print(f"Generated {len(df)} rows -> data/autism_screening.csv")
print(df["Class/ASD"].value_counts())
