# ============================================
# STEP 1: Our "dataset" — fake resumes for now
# ============================================

resumes = [
    "Python developer with experience in Django, REST APIs, and PostgreSQL",
    "Data scientist skilled in machine learning, pandas, numpy, and TensorFlow",
    "Frontend developer with React, JavaScript, CSS, and HTML experience",
    "Python machine learning engineer with scikit-learn and deep learning",
    "React developer experienced in TypeScript, Redux, and Node.js",
    "Backend engineer with Django, Flask, SQL databases and API development",
]

# These are the "answers" — what category each resume belongs to
labels = [
    "Backend Developer",
    "Data Scientist",
    "Frontend Developer",
    "Data Scientist",
    "Frontend Developer",
    "Backend Developer",
]


# ============================================
# STEP 2: Clean + Convert text → numbers (TF-IDF)
# ============================================

from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(resumes)

print("✅ TF-IDF done!")
print(f"Shape: {X.shape}")  # (6 resumes, N unique words)


# ============================================
# STEP 3: Train the model
# ============================================

from sklearn.naive_bayes import MultinomialNB

model = MultinomialNB()
model.fit(X, labels)

print("✅ Model trained!")


# ============================================
# STEP 4: Test it on a NEW resume it never saw
# ============================================

new_resume = ["I have no skills at all"]

new_resume_vectorized = vectorizer.transform(new_resume)
prediction = model.predict(new_resume_vectorized)

print(f"\n🧠 New resume predicted as: {prediction[0]}")