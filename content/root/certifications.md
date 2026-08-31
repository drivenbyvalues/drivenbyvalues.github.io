---
layout: resume
title: Certifications & Training
---

<div class="certifications-page">
    <section class="section">
        <h2 class="section-title">Professional Certifications</h2>
        
        <div class="certification-item">
            <div class="certification-header">
                <h3>Product Strategy - Improving Your Product Sense</h3>
                <span class="certification-date">2025</span>
            </div>
            <div class="certification-issuer">Maven Academy</div>
            <div class="certification-id">Verification ID: 
                <a href="https://www.virtualbadge.io/certificate-validator?credential=faa638c1-72ae-41e6-b91f-ff7d11963c04" target="_blank"> faa638c1-72ae-41e6-b91f-ff7d11963c04 </a>
            </div>
        </div>

        <div class="certification-item">
            <div class="certification-header">
                <h3>Managing your PM Career in 2025 and beyond</h3>
                <span class="certification-date">2024</span>
            </div>
            <div class="certification-issuer">Maven Academy - 
            <a href="https://maven.com/certificate/TOeXjwfY" target="_blank">View Credential</a></div>
        </div>

        <div class="certification-item">
            <div class="certification-header">
                <h3>Introduction to Generative AI with GPT</h3>
                <span class="certification-date">2023</span>
            </div>
            <div class="certification-issuer">LinkedIn Learning - 
             <a href="https://www.linkedin.com/learning/certificates/d9162913f24fd5d0e2d028bb8fb9d64c57aa5c28acefb067b4c1681472effd22" target="_blank">View Credential</a></div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">Training & Professional Development</h2>
        
        <div class="training-item">
            <div class="training-header">
                <h3>Advanced Machine Learning Specialization</h3>
                <span class="training-date">2024</span>
            </div>
            <div class="training-issuer">DeepLearning.AI (Coursera)</div>
            <div class="training-duration">4 months | 5 courses</div>
            <ul class="training-topics">
                <li>Neural Networks and Deep Learning</li>
                <li>Improving Deep Neural Networks</li>
                <li>Structuring Machine Learning Projects</li>
            </ul>
        </div>

        <div class="training-item">
            <div class="training-header">
                <h3>Cloud Architecture with Google Cloud</h3>
                <span class="training-date">2023</span>
            </div>
            <div class="training-issuer">Google Cloud Training</div>
            <div class="training-duration">6 weeks | 30 hours</div>
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">Conferences & Workshops</h2>
        
        <div class="conference-item">
            <div class="conference-header">
                <h3>AWS re:Invent</h3>
                <span class="conference-date">November 2023</span>
            </div>
            <div class="conference-location">Las Vegas, NV</div>
            <div class="conference-highlights">
                <h4>Key Takeaways:</h4>
                <ul>
                    <li>Serverless architecture patterns</li>
                    <li>AI/ML integration in cloud services</li>
                    <li>Cloud security best practices</li>
                </ul>
            </div>
        </div>
    </section>
</div>

<style>
.certifications-page {
    max-width: 900px;
    margin: 0 auto;
}

.certification-item, .training-item, .conference-item {
    background: var(--color-surface-card);
    border-left: 4px solid var(--accent-color);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.certification-item:hover, .training-item:hover, .conference-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.certification-header, .training-header, .conference-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.certification-header h3, .training-header h3, .conference-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--primary-color);
}

.certification-date, .training-date, .conference-date {
    color: var(--secondary-color);
    font-size: 0.9rem;
    white-space: nowrap;
    margin-left: 1rem;
}

.certification-issuer, .training-issuer, .conference-location {
    color: var(--secondary-color);
    font-style: italic;
    margin-bottom: 0.5rem;
}

.certification-id, .training-duration {
    font-size: 0.85rem;
    color: var(--color-text-subtle);
    margin-bottom: 0.5rem;
}

.certification-link {
    display: inline-block;
    color: var(--accent-color);
    text-decoration: none;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.certification-link:hover {
    text-decoration: underline;
}

.training-topics {
    margin: 0.75rem 0 0 1.5rem;
    padding: 0;
}

.training-topics li {
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
}

.conference-highlights {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--color-border);
}

.conference-highlights h4 {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    color: var(--primary-color);
}

@media (max-width: 768px) {
    .certification-header, .training-header, .conference-header {
        flex-direction: column;
    }
    
    .certification-date, .training-date, .conference-date {
        margin-left: 0;
        margin-top: 0.25rem;
    }
    
    .certification-item, .training-item, .conference-item {
        padding: 1.25rem;
    }
}
</style>
