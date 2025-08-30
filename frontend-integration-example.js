// Frontend Integration Example for A. Ali Murtaza Store API
// This file shows how to integrate the API with your React/Next.js frontend

const API_BASE_URL = 'http://localhost:4000/api';

// ==================== API Functions ====================

// Get all products with optional filtering
export const getProducts = async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    });

    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
    }
    
    return data.data;
};

// Get products by gender
export const getProductsByGender = async (gender, filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    });

    const response = await fetch(`${API_BASE_URL}/products/gender/${gender}?${params}`);
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
    }
    
    return data.data;
};

// Get product by slug (for detail pages)
export const getProductBySlug = async (slug) => {
    const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`);
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Product not found');
    }
    
    return data.data;
};

// ==================== Frontend Integration Examples ====================

// Example 1: Men's page component
export const MenPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenProducts = async () => {
            try {
                setLoading(true);
                const data = await getProductsByGender('men', {
                    page: 1,
                    limit: 20,
                    sort: 'createdAt',
                    order: 'desc'
                });
                
                // Transform API data to match your frontend structure
                const transformedProducts = data.products.map(product => ({
                    title: product.name,
                    src: product.media.thumbnail,
                    price: `$${(product.price.current / 100).toFixed(2)}`,
                    oldPrice: product.price.old ? `$${(product.price.old / 100).toFixed(2)}` : null,
                    slug: product.slug,
                    id: product._id
                }));
                
                setProducts(transformedProducts);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenProducts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Arrival
            title="Shop For New Arrival"
            cards={products}
            buttons={[
                { label: "Best Sellers", onClick: () => alert("Best Sellers clicked") },
                { label: "New Arrivals", onClick: () => alert("New Arrivals clicked") },
                { label: "Show All Arrivals", onClick: () => alert("Show All clicked") },
            ]}
        />
    );
};

// Example 2: Product detail page component
export const ProductDetailPage = ({ slug }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductBySlug(slug);
                
                setProduct(data.product);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>Product not found</div>;

    // Transform product data for your frontend
    const colorOptions = product.category.colors.map(color => 
        color.images
    );

    const sizes = product.category.colors[selectedColorIndex]?.sizes || [];

    return (
        <div className="w-[100%] flex flex-col justify-center items-start">
            <div className="w-[100%] flex flex-col md:flex-row justify-center items-start gap-[32px] px-[20px] md:px-[32px] py-[10]">
                {/* Product Images */}
                <div className="hidden md:block relative w-[100%] md:w-[868px]">
                    <div className="grid grid-cols-2 gap-[8px]">
                        {colorOptions[selectedColorIndex].map((imgUrl, idx) => (
                            <Image
                                key={idx}
                                src={imgUrl}
                                alt={`Color option ${idx}`}
                                width={9999}
                                height={9999}
                                className="w-[430px] h-[430px] object-cover rounded-[32px]"
                            />
                        ))}
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-[100%] md:w-[476px] mt-[24px] flex flex-col gap-[24px]">
                    <div className="flex flex-col gap-[20px]">
                        {/* Breadcrumb */}
                        <div className="flex justify-between">
                            <span className="font-[400] text-[14px]">
                                {product.category.gender.charAt(0).toUpperCase() + product.category.gender.slice(1)} 
                                <span className="px-[5px]"> → </span> 
                                {product.category.type.join(', ')}
                            </span>
                            {/* Rating */}
                            <div className="flex gap-[8px] items-center justify-center">
                                <div className="flex gap-[2px]">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-[12px] h-[12px] flex justify-center items-center">
                                            <InlineSVG icon="star" />
                                        </div>
                                    ))}
                                </div>
                                <p className="font-[600] text-[14px]">({product.rating?.count || 0})</p>
                            </div>
                        </div>

                        {/* Product Title and Price */}
                        <div className="flex flex-col gap-[16px]">
                            <p className="font-[700] text-[24px] leading-[32px]">{product.name}</p>
                            <div className="md:py-[6px] flex gap-[8px] items-center justify-start">
                                <p className="text-[#0D0D0D] font-[700] text-[18px] leading-[32px]">
                                    ${(product.price.current / 100).toFixed(2)}
                                </p>
                                {product.price.old && (
                                    <p className="text-[#B7B7B7] font-[600] text-[14px] leading-[20px]">
                                        ${(product.price.old / 100).toFixed(2)}
                                    </p>
                                )}
                                {product.price.discountPercentage && (
                                    <p className="text-[#1E1E1E] font-[600] text-[12px] leading-[20px]">
                                        {product.price.discountPercentage}% OFF
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="flex flex-col gap-[12px]">
                            <p className="ClashDisplay font-[600] text-[16px]">Colors</p>
                            <div className="grid grid-cols-5 md:grid-cols-6 gap-[7px] md:gap-[8px]">
                                {colorOptions.map((images, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedColorIndex(idx)}
                                        className={`w-[64px] md:w-[72px] h-[64px] md:h-[72px] rounded-[12px] cursor-pointer border-[2px] overflow-hidden 
                                            ${selectedColorIndex === idx ? "border-[#0D0D0D]" : "border-transparent"}`}
                                    >
                                        <img
                                            src={images[0]}
                                            alt={`Color ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="flex flex-col gap-[20px]">
                            <div className="flex flex-col gap-[12px]">
                                <div className="flex justify-between h-[24px]">
                                    <p className="ClashDisplay font-[600] text-[16px]">Sizes</p>
                                    <div className="flex gap-[8px] items-center">
                                        <InlineSVG icon="ruler" />
                                        <p className="font-[600] text-[14px]">Size Guide</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 md:gap-[8px]">
                                    {sizes.map((size, idx) => (
                                        <div 
                                            key={idx}
                                            className={`w-[72px] h-[48px] py-[8px] px-[16px] rounded-[12px] flex justify-center items-center
                                                ${size.stock > 0 ? 'bg-[#F4F4F4]' : 'bg-[#F4F4F4] opacity-50'}`}
                                        >
                                            <p className="font-[700] text-[14px]">{size.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Example 3: Hook for fetching products
export const useProducts = (gender = null, filters = {}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let data;
                
                if (gender) {
                    data = await getProductsByGender(gender, filters);
                } else {
                    data = await getProducts({ ...filters, gender });
                }
                
                setProducts(data.products);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [gender, JSON.stringify(filters)]);

    return { products, loading, error };
};

// Example 4: Hook for fetching a single product
export const useProduct = (slug) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductBySlug(slug);
                setProduct(data.product);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    return { product, loading, error };
};

// ==================== Usage Examples ====================

// In your Men.js component:
/*
import { useProducts } from './frontend-integration-example';

export default function Men() {
    const { products, loading, error } = useProducts('men', {
        page: 1,
        limit: 20,
        sort: 'createdAt',
        order: 'desc'
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const Arrivalsdata = products.map(product => ({
        title: product.name,
        src: product.media.thumbnail,
        price: `$${(product.price.current / 100).toFixed(2)}`,
        oldPrice: product.price.old ? `$${(product.price.old / 100).toFixed(2)}` : null,
    }));

    return (
        <Arrival
            title="Shop For New Arrival"
            cards={Arrivalsdata}
            buttons={[
                { label: "Best Sellers", onClick: () => alert("Best Sellers clicked") },
                { label: "New Arrivals", onClick: () => alert("New Arrivals clicked") },
                { label: "Show All Arrivals", onClick: () => alert("Show All clicked") },
            ]}
        />
    );
}
*/

// In your product detail page:
/*
import { useProduct } from './frontend-integration-example';

export default function ProductDetail({ params }) {
    const { product, loading, error } = useProduct(params.slug);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>Product not found</div>;

    // Use the product data in your existing component structure
    // ...
}
*/
