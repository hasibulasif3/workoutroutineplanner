
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';

export default function Refund() {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <motion.div 
          className="max-w-4xl mx-auto prose prose-invert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center title-gradient">Refund Policy</h1>
          
          <div className="space-y-6">
            <section>
              <h2>1. Overview</h2>
              <p>
                This Refund Policy outlines the procedures and conditions for refunds for Workout Routine Planner services. We strive to provide the highest quality services, but we understand that there may be situations where a refund is warranted.
              </p>
            </section>
            
            <section>
              <h2>2. Eligibility for Refunds</h2>
              <p>
                You may be eligible for a refund under the following circumstances:
              </p>
              <ul>
                <li>Duplicate payment or billing error</li>
                <li>Technical issues that prevent service usage (if not resolved within 7 days)</li>
                <li>Cancellation of subscription within the first 14 days (for new subscribers only)</li>
                <li>Service not as described in our promotional materials</li>
              </ul>
            </section>
            
            <section>
              <h2>3. Refund Process</h2>
              <p>
                To request a refund, please follow these steps:
              </p>
              <ol>
                <li>Contact our customer support team via email at info@workoutroutineplanner.fit</li>
                <li>Provide your account information and details about your purchase</li>
                <li>Explain the reason for your refund request</li>
                <li>Include any relevant supporting documentation</li>
              </ol>
              <p>
                We will review your request and respond within 5 business days.
              </p>
            </section>
            
            <section>
              <h2>4. Refund Timelines</h2>
              <p>
                Once approved, refunds will be processed as follows:
              </p>
              <ul>
                <li>Credit/Debit Card payments: 5-10 business days</li>
                <li>Bank Transfers: 7-14 business days</li>
                <li>Digital Wallets: 3-5 business days</li>
              </ul>
              <p>
                Please note that the actual time for a refund to appear in your account may vary depending on your financial institution.
              </p>
            </section>
            
            <section>
              <h2>5. Non-Refundable Items</h2>
              <p>
                The following are not eligible for refunds:
              </p>
              <ul>
                <li>Subscription fees after the 14-day trial period</li>
                <li>Add-on services that have been fully delivered</li>
                <li>Account termination due to violations of our Terms of Service</li>
              </ul>
            </section>
            
            <section>
              <h2>6. Special Circumstances</h2>
              <p>
                We understand that special circumstances may arise. We will consider requests outside of this policy on a case-by-case basis. Please contact our customer support team to discuss your situation.
              </p>
            </section>
            
            <section>
              <h2>7. Updates to This Policy</h2>
              <p>
                We reserve the right to update this Refund Policy at any time. Any changes will be effective when posted on this page.
              </p>
            </section>
            
            <section>
              <h2>8. Contact Information</h2>
              <p>
                If you have any questions about this Refund Policy, please contact us at:
              </p>
              <p>
                Email: info@workoutroutineplanner.fit<br />
                Phone: +8801886-102806
              </p>
            </section>
            
            <p className="text-sm text-gray-400">Last Updated: June 15, 2023</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
