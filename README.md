# 📈 Financial Charting Dashboard

An interactive financial charting dashboard built with **React, Next.js, TypeScript, Lightweight Charts, TensorFlow.js, and AWS Amplify**.  
The app visualizes OHLCV data, overlays technical indicators, and integrates a supervised machine learning model to predict regime labels (uptrend, downtrend, flat).

**Live Demo:** [https://main.d21csqh8ne40re.amplifyapp.com/](https://main.d21csqh8ne40re.amplifyapp.com/)

---

## ✨ Features

- Interactive candlestick charts with overlays for EMA, RSI, Bollinger Bands, VWAP, OBV, and volatility
- Episode builder: groups bars into zig‑zag swing episodes, computing slope, R² fit, aggregates, and start/end snapshots
- Feature engineering: 37 engineered features per episode, including normalized values, regression slope, and indicator aggregates
- Supervised ML model: multi‑layer perceptron (MLP) classifier implemented in TensorFlow.js
- Cloud deployment: hosted on AWS Amplify, leveraging S3 + CloudFront for static assets and Lambda functions for API routes
- Secure API integration: Alpaca market data accessed via environment variables and IAM‑managed secrets

---

## 🔄 Data Pipeline

1. **Raw Bars → Normalized Rows**  
   OHLCV bars with indicators (EMA, RSI, VWAP, OBV, Bollinger Bands). Normalization and imputation applied.
2. **Rows → Episodes**  
   Zig‑zag swing detection groups bars into episodes. Each episode stores slope, R² fit, aggregates, start/end snapshots. Trend quality flagged as _strong_ or _weak_ based on R².
3. **Episodes → Feature Vectors**  
   37 engineered features extracted per episode. StandardScaler applied for normalization.
4. **Feature Vectors → Labels**  
   Direction labels (Up/Down/Flat) or Trend Quality (Strong/Weak). One‑hot encoded.
5. **Training**  
   Multi‑layer perceptron (MLP) classifier in TensorFlow.js. Loss: categorical cross‑entropy. Optimizer: Adam. Evaluated with confusion matrix, precision, recall, F1, and cross‑validation.
6. **Inference → Chart Markers**  
   Softmax probabilities mapped to regime labels. Predictions visualized as markers on candlestick charts.

---

## 🧠 Model Details

**Architecture**

- Input: 37 engineered features from each episode
- Layers: Dense(64, ReLU) → Dropout(0.2) → Dense(32, ReLU) → Dense(3, Softmax)
- Loss: categorical cross‑entropy
- Optimizer: Adam (learning rate 0.001)
- Output: probability distribution over 3 classes (Up, Down, Flat)

**Why MLP?**

- Linear regression / OLS → suited for continuous targets, not categorical labels
- Logistic regression → could classify episodes, but assumes linear separability and misses nonlinear feature interactions
- Random forest → captures nonlinearity but is heavier to deploy in TensorFlow.js and less browser‑friendly
- **MLP chosen because:** captures nonlinear relationships among indicators, lightweight enough for browser inference, outputs interpretable softmax probabilities, integrates seamlessly with frontend overlays

**Labels**

- Direction mode: Up / Down / Flat
- Trend quality mode: Strong / Weak
- Labels are one‑hot encoded during training

**Evaluation**

- Train/test split (80/20)
- Metrics: accuracy, confusion matrix, precision, recall, F1 (macro and weighted)
- Cross‑validation (k‑fold) supported

---

## 📊 Example Workflow

1. User selects ticker and timeframe
2. API route fetches OHLCV bars from Alpaca
3. Episode builder groups bars into zig‑zag swings
4. Features engineered (volume, RSI, Bollinger, VWAP, OBV, regression slope/R²)
5. TensorFlow.js MLP predicts regime label
6. Chart overlays markers (up/down/flat) based on predictions

---

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, TypeScript, Zustand
- **Visualization**: Lightweight Charts
- **ML**: TensorFlow.js (MLP classifier)
- **Cloud**: AWS Amplify, S3, CloudFront, Lambda
- **Data**: Alpaca Market Data API

---

## 📚 Model Documentation

### Features Used

Each episode is represented by a 37‑dimensional feature vector engineered from OHLCV data and technical indicators. Features include:

- **Episode metadata**: duration, total return, price start/end, price delta
- **Regression features**: linear regression slope (lr_slope_5), normalized slope, R² fit quality
- **Volume features**: average volume, normalized average volume, max volume
- **RSI features**: average RSI, normalized RSI, start/end RSI values (raw + normalized)
- **Volatility features**: average volatility, normalized volatility
- **OBV features**: OBV change, normalized OBV change, start/end OBV values (raw + normalized)
- **VWAP features**: average VWAP, normalized VWAP, start/end VWAP values (raw + normalized)
- **EMA features**: start/end EMA values (raw + normalized)
- **Normalization & imputation**: missing values handled via sentinel/mean/median strategies, then standardized with `StandardScaler`

### Label Definitions

Two supervised modes are supported:

- **Direction labels (3 classes)**
  - Uptrend → `[1,0,0]`
  - Downtrend → `[0,1,0]`
  - Flat → `[0,0,1]`

- **Trend quality labels (2 classes)**
  - Strong trend → `[1,0]`
  - Weak trend → `[0,1]`

Labels are one‑hot encoded during training. Composite labels (e.g., `Up_Strong`) can be derived for analysis but are not directly modeled.

### Evaluation Metrics

The model is evaluated using multiple metrics to ensure balanced performance across classes:

- **Accuracy**: overall percentage of correctly classified episodes
- **Confusion Matrix**: counts of true vs. predicted labels for each class
- **Precision**: proportion of predicted positives that are correct (per class and weighted)
- **Recall**: proportion of actual positives correctly identified (per class and weighted)
- **F1 Score**: harmonic mean of precision and recall (per class, macro average, weighted average)
- **Cross‑Validation**: k‑fold CV (default 5 folds) to assess stability and generalization

These metrics provide a comprehensive view of model performance beyond simple accuracy, highlighting strengths and weaknesses in classifying different regimes.

## 🔗 Links

- GitHub: [your repo link]
- Live Demo: [https://main.d21csqh8ne40re.amplifyapp.com/](https://main.d21csqh8ne40re.amplifyapp.com/)
