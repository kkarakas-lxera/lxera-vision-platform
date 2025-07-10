import React from 'react';
import SmartEmailCapture from '@/components/forms/SmartEmailCapture';
import { toast } from '@/components/ui/use-toast';

const TestEarlyAccess = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Testing SmartEmailCapture Component</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 1: Default variant</h2>
          <SmartEmailCapture
            source="test-page"
            variant="default"
            buttonText="Get Early Access"
            placeholder="Enter your work email"
            onSuccess={(email) => {
              console.log('Success! Email:', email);
              toast({
                title: 'Success!',
                description: `Email captured: ${email}`,
              });
            }}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 2: With initial email and autoSubmit=false</h2>
          <SmartEmailCapture
            source="test-page-auto"
            variant="default"
            buttonText="Get Early Access"
            placeholder="Enter your work email"
            initialEmail="test@example.com"
            autoSubmit={false}
            onSuccess={(email) => {
              console.log('Success! Email:', email);
              toast({
                title: 'Success!',
                description: `Email captured: ${email}`,
              });
            }}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 3: With custom className</h2>
          <SmartEmailCapture
            source="test-page-custom"
            variant="default"
            buttonText="Get Early Access"
            placeholder="Enter your work email"
            className="w-full [&_button]:bg-gradient-to-r [&_button]:from-future-green [&_button]:to-future-green/90"
            onSuccess={(email) => {
              console.log('Success! Email:', email);
              toast({
                title: 'Success!',
                description: `Email captured: ${email}`,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TestEarlyAccess;