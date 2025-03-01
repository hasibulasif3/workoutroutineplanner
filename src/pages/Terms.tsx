
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <motion.div 
          className="max-w-4xl mx-auto prose prose-invert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center title-gradient">Terms and Conditions</h1>
          
          <div className="space-y-6">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Workout Routine Planner, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our service.
              </p>
            </section>
            
            <section>
              <h2>2. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any significant changes by posting a notice on our website. Your continued use of the Service after changes are made constitutes your acceptance of the updated Terms.
              </p>
            </section>
            
            <section>
              <h2>3. User Accounts</h2>
              <p>
                To access certain features of our Service, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>
            
            <section>
              <h2>4. User Content</h2>
              <p>
                You retain all rights to any content you submit, post, or display on or through the Service. By submitting content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display that content in connection with the services we provide to you.
              </p>
            </section>
            
            <section>
              <h2>5. Prohibited Activities</h2>
              <p>
                You agree not to engage in any of the following activities:
              </p>
              <ul>
                <li>Violating any applicable laws or regulations</li>
                <li>Impersonating another person or entity</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Using the Service for any illegal purpose</li>
                <li>Interfering with or disrupting the integrity of the Service</li>
              </ul>
            </section>
            
            <section>
              <h2>6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by Unfit Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>
            
            <section>
              <h2>7. Limitation of Liability</h2>
              <p>
                In no event shall Unfit Inc., its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>
            
            <section>
              <h2>8. Governing Law</h2>
              <p>
                These Terms shall be governed by and defined following the laws of [Your Country]. Unfit Inc. and yourself irrevocably consent to the exclusive jurisdiction and venue of the [Your City] courts for any disputes arising under these Terms.
              </p>
            </section>
            
            <section>
              <h2>9. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                Email: info@workoutroutineplanner.fit<br />
                Phone: +8801886-102806
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
