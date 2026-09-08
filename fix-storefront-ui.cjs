const fs = require('fs');
let file = 'services/frontend-store/src/components/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add a cardDetails state
content = content.replace(
  /const \[customerInfo, setCustomerInfo\] = useState\(\{/,
  `const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });\n  const [customerInfo, setCustomerInfo] = useState({`
);

// Clear the hardcoded Thabiso defaults if the user wants it to be empty initially?
// But the user said "shows my hard coded details". Let's clear them so they have to type.
content = content.replace(
  /name: 'Thabiso Matsaba',\n    email: 'thabiso@example.com',\n    phone: '\+27 82 555 0192',\n    address: '142 Sandton Boulevard, Sandhurst',\n    city: 'Johannesburg',\n    postalCode: '2196',\n    paymentMethod: 'instant-eft'/g,
  `name: '',\n    email: '',\n    phone: '',\n    address: '',\n    city: '',\n    postalCode: '',\n    paymentMethod: 'card'`
);

// Update Step 2 UI to show card inputs
const step2Regex = /<div className="grid grid-cols-3 gap-2">[\s\S]*?<\/div>\n\s*<\/div>/;
const newStep2 = `<div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'instant-eft', label: 'Instant EFT (Ozow)' },
                      { id: 'card', label: 'Credit/Debit Card' },
                      { id: 'crypto', label: 'BTC Lightning' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: m.id })}
                        className={\`p-3 rounded-lg border text-center transition-all \${
                          customerInfo.paymentMethod === m.id
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-[#010409] border-slate-800 text-slate-400 hover:text-white'
                        }\`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {customerInfo.paymentMethod === 'card' && (
                    <div className="mt-4 p-4 border border-slate-800 rounded-lg bg-[#010409] space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="0000 0000 0000 0000"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full px-3 py-2 bg-transparent border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full px-3 py-2 bg-transparent border border-slate-800 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-3 py-2 bg-transparent border border-slate-800 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>`;

content = content.replace(step2Regex, newStep2);

// Make sure handlePlaceOrder validates the form
const handlePlaceOrderRegex = /const handlePlaceOrder = async \(\) => \{\n\s*try \{/g;
const newHandlePlaceOrder = `const handlePlaceOrder = async () => {
    if (customerInfo.paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      alert("Please fill in your card details.");
      return;
    }
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      alert("Please fill in your shipping details.");
      setCheckoutStep(1);
      return;
    }
    try {`;
content = content.replace(handlePlaceOrderRegex, newHandlePlaceOrder);

fs.writeFileSync(file, content);
