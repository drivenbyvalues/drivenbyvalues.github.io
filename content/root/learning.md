---
layout: resume
title: Learning Resources & Growth
---

<div class="learning-page">
    <section class="section">
        <h2 class="section-title">Currently Learning</h2>
        
        <div class="learning-item">
            <div class="learning-header">
                <h3>Advanced Cloud Security</h3>
                <span class="learning-status">In Progress</span>
            </div>
            <div class="learning-source">Cloud Security Alliance</div>
            <div class="learning-details">
                <p>Deep dive into cloud security best practices, identity management, and compliance frameworks.</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: 60%;">60%</div>
                </div>
            </div>
        </div>

        <div class="learning-item">
            <div class="learning-header">
                <h3>Machine Learning Engineering</h3>
                <span class="learning-status">In Progress</span>
            </div>
            <div class="learning-source">Fast.ai</div>
            <div class="learning-details">
                <p>Practical deep learning for coders. Focus on implementing ML models in production environments.</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: 40%;">40%</div>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">Learning Paths</h2>
        
        <div class="path-container">
            <div class="path-card">
                <h3>Cloud Architecture</h3>
                <ul class="path-topics">
                    <li class="completed">Cloud Fundamentals</li>
                    <li class="completed">Infrastructure as Code</li>
                    <li class="in-progress">Advanced Networking</li>
                    <li>Security & Compliance</li>
                    <li>Multi-Cloud Strategies</li>
                </ul>
            </div>

            <div class="path-card">
                <h3>Data Science</h3>
                <ul class="path-topics">
                    <li class="completed">Python for Data Analysis</li>
                    <li class="completed">Statistical Modeling</li>
                    <li class="in-progress">Machine Learning</li>
                    <li>Deep Learning</li>
                    <li>ML Ops</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">Book Recommendations</h2>
        
        <div class="book-grid">
            <div class="book-card">
                <div class="book-cover" style="background-color: #4a6fa5;">DDIA</div>
                <h3>Designing Data-Intensive Applications</h3>
                <div class="book-author">Martin Kleppmann</div>
                <div class="book-status">Currently Reading</div>
            </div>

            <div class="book-card">
                <div class="book-cover" style="background-color: #e74c3c;">SRE</div>
                <h3>Site Reliability Engineering</h3>
                <div class="book-author">Betsy Beyer et al.</div>
                <div class="book-status">Planned</div>
            </div>

            <div class="book-card">
                <div class="book-cover" style="background-color: #2ecc71;">CL</div>
                <h3>Clean Code</h3>
                <div class="book-author">Robert C. Martin</div>
                <div class="book-status completed">Completed</div>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">Learning Resources</h2>
        
        <div class="resources-grid">
            <a href="https://www.coursera.org/" class="resource-card" target="_blank">
                <i class="fas fa-graduation-cap"></i>
                <h3>Coursera</h3>
                <p>Online courses from top universities and companies</p>
            </a>

            <a href="https://www.pluralsight.com/" class="resource-card" target="_blank">
                <i class="fas fa-laptop-code"></i>
                <h3>Pluralsight</h3>
                <p>Technology skills platform</p>
            </a>

            <a href="https://www.oreilly.com/" class="resource-card" target="_blank">
                <i class="fas fa-book"></i>
                <h3>O'Reilly</h3>
                <p>Technology and business learning</p>
            </a>

            <a href="https://www.udemy.com/" class="resource-card" target="_blank">
                <i class="fas fa-chalkboard-teacher"></i>
                <h3>Udemy</h3>
                <p>Online learning marketplace</p>
            </a>
        </div>
    </section>
</div>

<style>
.learning-page {
    max-width: 1100px;
    margin: 0 auto;
}

.learning-item {
    background: var(--color-surface-card);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    border-left: 4px solid var(--accent-color);
}

.learning-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.learning-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--primary-color);
}

.learning-status {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.learning-source {
    color: var(--secondary-color);
    font-style: italic;
    margin-bottom: 1rem;
}

.progress-container {
    height: 8px;
    background-color: var(--color-surface-2);
    border-radius: 4px;
    margin-top: 1rem;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: var(--accent-color);
    border-radius: 4px;
    color: white;
    font-size: 0.7rem;
    text-align: right;
    padding-right: 4px;
    line-height: 8px;
}

.path-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 1.5rem 0;
}

.path-card {
    background: var(--color-surface-card);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.path-card h3 {
    margin-top: 0;
    color: var(--primary-color);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
}

.path-topics {
    list-style: none;
    padding: 0;
    margin: 0;
}

.path-topics li {
    padding: 0.5rem 0;
    position: relative;
    padding-left: 1.75rem;
}

.path-topics li:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.9rem;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 50%;
}

.path-topics li.completed:before {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
}

.path-topics li.in-progress:before {
    background-color: #ffc107;
    border-color: #ffc107;
}

.book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 1.5rem 0;
}

.book-card {
    background: var(--color-surface-card);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.2s;
}

.book-card:hover {
    transform: translateY(-5px);
}

.book-cover {
    width: 60px;
    height: 80px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
    border-radius: 4px;
}

.book-card h3 {
    margin: 0.5rem 0 0.25rem;
    font-size: 1rem;
    color: var(--primary-color);
}

.book-author {
    color: var(--secondary-color);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
}

.book-status {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    background-color: var(--color-surface-2);
    color: #666;
}

.book-status.completed {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
    margin: 1.5rem 0;
}

.resource-card {
    background: var(--color-surface-card);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    color: var(--accent-color);
}

.resource-card i {
    font-size: 2rem;
    color: var(--accent-color);
    margin-bottom: 1rem;
    display: block;
}

.resource-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: var(--primary-color);
}

.resource-card p {
    margin: 0;
    color: var(--secondary-color);
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .path-container,
    .book-grid,
    .resources-grid {
        grid-template-columns: 1fr;
    }
    
    .learning-item {
        padding: 1.25rem;
    }
}
</style>
