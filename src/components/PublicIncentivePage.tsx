import { useState } from 'react';
import { CheckCircleIcon, ClipboardIcon } from './icons';

const platforms = [
  { name: 'Trustpilot', url: 'https://www.trustpilot.com/' },
  { name: 'Google Reviews', url: 'https://www.google.com/search?q=vlemobile' },
  { name: 'Facebook Reviews', url: 'https://www.facebook.com/vlemobile/reviews/' },
  { name: 'Yelp', url: 'https://www.yelp.com/biz/vlemobile' }
];

const gifts = [
  { tier: 1, name: 'Free Phone Case', value: 15, image: 'https://picsum.photos/id/1076/200/200' },
  { tier: 2, name: 'Free Earbuds', value: 30, image: 'https://picsum.photos/id/1078/200/200' },
  { tier: 3, name: 'Free Wireless Charger', value: 50, image: 'https://picsum.photos/id/1079/200/200' }
];

const REDEMPTION_EMAIL = 'redeem@vlemobile.com';

function PublicIncentivePage() {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(REDEMPTION_EMAIL);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank you for your 5-star review!
            </h1>
            <p className="text-lg text-gray-600">
              Your review is now live on our website. Help others discover us by sharing your experience on popular review sites and earn free gifts!
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Earn Free Gifts for Your Honest Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <div
                  key={gift.tier}
                  className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="font-semibold text-gray-800 mb-2">
                    Leave {gift.tier}+ public review{gift.tier > 1 ? 's' : ''}
                  </p>
                  <p className="text-xl font-bold text-brand-orange mb-1">
                    {gift.name}
                  </p>
                  <p className="text-sm text-gray-500">Value ${gift.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              How to Redeem Your Gift:
            </h3>

            <ol className="space-y-6">
              <li>
                <div className="mb-2">
                  <span className="font-bold text-gray-900">1. Leave your reviews.</span>
                  <span className="text-gray-700"> Click the buttons below to leave your review on each platform.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {platforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-gray-300 rounded-md px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {platform.name}
                    </a>
                  ))}
                </div>
              </li>

              <li>
                <span className="font-bold text-gray-900">2. Take screenshots</span>
                <span className="text-gray-700"> of your published reviews.</span>
              </li>

              <li>
                <div className="mb-2">
                  <span className="font-bold text-gray-900">3. Email us the screenshots.</span>
                  <span className="text-gray-700"> Send an email with your order number and name to:</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-white border border-brand-orange rounded px-4 py-2 font-mono text-brand-orange flex-1">
                    {REDEMPTION_EMAIL}
                  </div>
                  <button
                    onClick={copyEmail}
                    className="relative bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    aria-label="Copy email address"
                  >
                    {emailCopied ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ClipboardIcon className="w-5 h-5 text-gray-600" />
                    )}
                    {emailCopied && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </li>

              <li>
                <span className="font-bold text-gray-900">4. Receive your gift!</span>
                <span className="text-gray-700"> We'll process your free gift within 2-3 business days.</span>
              </li>
            </ol>
          </div>

          <div className="text-center space-y-4">
            <button
              className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              I've Completed My Reviews
            </button>

            <div className="text-sm text-gray-500">
              <a
                href="#"
                className="hover:text-brand-orange underline transition-colors"
              >
                Terms & Conditions
              </a>
              <span className="mx-2">|</span>
              <a
                href="#"
                className="hover:text-brand-orange underline transition-colors"
              >
                Questions? Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicIncentivePage;
