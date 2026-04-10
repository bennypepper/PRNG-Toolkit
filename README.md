# PRNG Toolkit

A modern, educational web-based tool to generate, test, and visualize pseudo-random numbers using various algorithms and rigorous statistical tests. 

PRNG Toolkit provides a warm, user-friendly interface to explore different generation algorithms, perform strict hypothesis tests on the output, and fundamentally understand the quality of generated sequences. Originally built as a vital testing hub for a university Modeling and Simulation course, it is perfect for students, developers needing valid data for simulations, and anyone interested in the math behind computer randomness!

## ✨ Features

- **Advanced Generation Algorithms**:
  - **Mersenne Twister (MT19937)**: The gold standard for modern PRNG, featuring a massive period of $2^{19937}-1$.
  - **Permuted Congruential Generator (PCG32)**: A highly modern algorithm offering excellent speed and perfect statistical performance.
  - **Linear Congruential Generator (LCG)**: A classic algorithm with presets from famous implementations (`Numerical Recipes`, `glibc`, `Java`) and custom parameter inputs.
  - **Middle-Square**: The historical algorithm by John von Neumann for educational comparison.

- **Flexible Generation Options**:
  - Configurable Auto-Seed with desired digit length.
  - Fast generation engines capable of processing thousands of numbers.
  - Configuration management (Save, load, and reset your generator settings).

- **Comprehensive Statistical Testing (Hypothesis Testing)**:
  - **Test Your Own Data**: Upload a `.csv`, `.xlsx`, or `.txt` file with your own numbers for analysis.
  - **Formal Hypothesis Testing**: Each test result is presented with a Null Hypothesis ($H_0$), P-Value thresholds, and a clear step-by-step conclusion (e.g., "Reject $H_0$").
  - **Included Tests**:
    - Frequency Test (Monobit)
    - Runs Test
    - Chi-Square Uniformity Test
    - Autocorrelation Test
    - Poker Test

- **Insightful Visualizations**:
  - **Histogram**: Visually check for number uniformity with the Chi-Square test results.
  - **Scatter Plot**: Analyze number independence by plotting $R_i$ vs $R_{i+1}$ in the Autocorrelation test.

- **Warm & Educational Interface**:
  - **MathJax Integration**: Beautifully renders LaTeX math formulas ($X_{n+1}$, $\chi^2$, etc.) directly in the browser so you can learn the exact math behind the magic.
  - **Fully Responsive & Accessible**: Follows a strict 8pt grid with high-contrast elements.
  - **Dark Mode**: Comes out of the box with a beautiful, eye-relieving dark mode!
  - **Multi-tab Layout**: Separate panels for Generator, Statistical Tester, and Educational sections.

- **Versatile Export Options**:
  - Download generated numbers as `.csv`, `.xlsx`, or `.txt`.
  - Choose between Raw integer output or Normalized (0-1) floating-point values.

## 🚀 How to Use

The application is completely front-end! No build steps or frameworks required.

1.  **Clone or Download** this repository.
2.  Open the `index.html` file in any modern web browser (like Chrome, Firefox, or Safari).
    - *Alternatively, serve it locally using live-server or a simple Python static server `python -m http.server 8000`.*
3.  **Generate & Test**:
    - Select a generation method on the **Generator** tab.
    - Click **"Generate & Test"**.
    - Watch the numbers populate and head to the **Tester & Visualizer** tab to see if your algorithm passed the audit!

## 🛠️ Technologies Used

-   **HTML5 & Vanilla JavaScript (ES6+)**: Decoupled, clean architecture (`app.js` runs the heavy statistical logic).
-   **Tailwind CSS**: For the stunning, accessible, dark-mode native UI.
-   **MathJax**: To elegantly render mathematical formulas.
-   **Chart.js**: For creating interactive dynamic charts.
-   **SheetJS**: For parsing and creating `.xlsx` files without backend processing.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, tests, or improvements, please feel free to fork the repository and submit a pull request. You can also open an issue to report bugs or suggest enhancements.
