const fs = require('fs');
let file = 'src/components/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Inject new imports for UI (User, ListOrdered, LogOut)
content = content.replace(
  /import \{ (.*?) \} from 'lucide-react';/,
  `import { $1, User, ListOrdered, LogOut } from 'lucide-react';`
);

// Inject Auth State
content = content.replace(
  /const \[cart, setCart\] = useState<CartItem\[\]>\(\[\]\);/,
  `const [cart, setCart] = useState<CartItem[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  
  useEffect(() => {
    if (authToken) {
       // Just basic setup, normally we'd fetch profile
       try {
         const payload = JSON.parse(atob(authToken.split('.')[1]));
         setUserProfile(payload);
       } catch(e) { setAuthToken(null); }
    }
  }, [authToken]);`
);

// Inject Auth Handlers
const authHandlers = `
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const res = await fetch(\`\${backendUrl}\${endpoint}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      setAuthToken(data.token);
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
      if (data.user) {
         setCustomerInfo(prev => ({ ...prev, name: data.user.name || '', email: data.user.email || '' }));
      }
    } catch(err: any) {
      alert(err.message || "Authentication failed");
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const res = await fetch(\`\${backendUrl}/api/v1/orders/history\`, {
        headers: { 'Authorization': \`Bearer \${authToken}\` }
      });
      const data = await res.json();
      if (res.ok) setOrderHistory(data.data);
    } catch(err) {
      console.warn(err);
    }
  };
  
  useEffect(() => {
    if (showOrderHistory && authToken) fetchOrderHistory();
  }, [showOrderHistory, authToken]);
`;

content = content.replace(
  /const handleAddToCart = async /,
  authHandlers + '\n  const handleAddToCart = async '
);

// Include Bearer token in checkout request
content = content.replace(
  /headers: \{ 'Content-Type': 'application\/json' \},/,
  `headers: { 'Content-Type': 'application/json', ...(authToken ? { 'Authorization': \`Bearer \${authToken}\` } : {}) },`
);

// Pre-fill user data dynamically if logged in
content = content.replace(
  /name: '',\s*email: '',/,
  `name: userProfile?.name || '',\n    email: userProfile?.email || '',`
);

fs.writeFileSync(file, content);
