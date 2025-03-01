
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <motion.div 
          className="max-w-4xl mx-auto prose prose-invert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center title-gradient">Privacy Policy</h1>
          
          <div className="space-y-6">
            <section>
              <h2>1. Introduction</h2>
              <p>
                At Workout Routine Planner, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
              </p>
            </section>
            
            <section>
              <h2>2. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you:
              </p>
              <ul>
                <li>Register for an account</li>
                <li>Create or modify your profile</li>
                <li>Create workout routines</li>
                <li>Contact customer support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
            </section>
            
            <section>
              <h2>3. How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including to:
              </p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Develop new products and services</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>
            
            <section>
              <h2>4. Sharing of Information</h2>
              <p>
                We may share your personal information with:
              </p>
              <ul>
                <li>Service providers who perform services on our behalf</li>
                <li>Business partners with whom we jointly offer products or services</li>
                <li>Legal authorities when required by law or to protect our rights</li>
              </ul>
            </section>
            
            <section>
              <h2>5. Data Security</h2>
              <p>
                We implement reasonable security measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>
            
            <section>
              <h2>6. Your Choices</h2>
              <p>
                You may update, correct, or delete your account information at any time by logging into your account. You may also opt out of receiving promotional emails by following the instructions in those emails.
              </p>
            </section>
            
            <section>
              <h2>7. Children's Privacy</h2>
              <p>
                Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us.
              </p>
            </section>
            
            <section>
              <h2>8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>
            
            <section>
              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
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
