import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Image as ImageIcon,
  Loader2,
  Save,
  Tag,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

type ProductBadge = 'None' | 'Bestseller' | 'Trending' | 'Recommended' | 'New Arrival';
type ProductCategory = 'Gemstones' | 'Rudraksha' | 'Yantra' | 'Astrology Books' | 'Spiritual Accessories';

const CATEGORIES: ProductCategory[] = [
  'Gemstones',
  'Rudraksha',
  'Yantra',
  'Astrology Books',
  'Spiritual Accessories',
];

const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-[#77748A] bg-[#171626] px-3 text-sm text-[#F4F0E7] outline-none transition-colors placeholder:text-[#AAA8B5] focus:border-[#D9A638] focus:ring-1 focus:ring-[#D9A638]/30';

export const AdminAddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [badge, setBadge] = useState<ProductBadge>('None');
  const [category, setCategory] = useState<ProductCategory>('Gemstones');
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const numericPrice = Number(price);
  const numericMrp = Number(mrp);
  const discount =
    numericPrice > 0 && numericMrp >= numericPrice
      ? Math.round(((numericMrp - numericPrice) / numericMrp) * 100)
      : 0;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setImageError(null);
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError('Choose a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setSaveMessage(null);
      } else {
        setImageError('Could not preview the selected image.');
      }
    };
    reader.onerror = () => setImageError('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage(null);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0 || !Number.isFinite(numericMrp) || numericMrp < numericPrice) {
      setSaveMessage('Enter a valid selling price and an MRP equal to or above it.');
      return;
    }
    if (!image) {
      setSaveMessage('Upload a product image before saving.');
      return;
    }

    setSaving(true);

    try {
      const result = await adminService.createProduct({
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        price: numericPrice,
        mrp: numericMrp,
        badge,
        category,
        image,
      });

      setSaveMessage(result.message || 'Product created successfully!');

      // Redirect to store products list after a short delay
      setTimeout(() => {
        navigate('/admin/store');
      }, 1500);
    } catch (error: any) {
      setSaveMessage(error.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-4 text-[#F4F0E7]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="text-[#AAA8B5]">Console</span>
          <span className="text-white/30">/</span>
          <span className="text-[#C9A45C]">Cosmic Store</span>
          <span className="text-white/30">/</span>
          <span className="text-[#F4F0E7]">Add Product</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#D8A83F] via-[#FFF0C8] to-[#C9A45C] sm:text-3xl">
            Add Cosmic Product
          </h1>
          <p className="font-serif text-xs italic text-[#A7A4C4]">Create a new product for your cosmic store.</p>
        </div>
        <Link
          to="/admin/store"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-[#D6CEBE] transition-colors hover:border-[#C9A45C]/40 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#C9A45C]" />
          Back to Products List
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-[#383654] bg-[#10101F] shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#383654] bg-[#1B1A34] px-5 py-3.5">
              <Tag className="h-5 w-5 text-[#E0AE3F]" />
              <h2 className="font-serif text-base font-bold uppercase tracking-wide text-[#F0E8D8]">Product Details</h2>
            </div>

            <div className="space-y-4 p-5">
              <label className="block text-sm font-semibold text-[#E8E4DC]">
                Product Name <span className="text-rose-400">*</span>
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSaveMessage(null);
                  }}
                  className={fieldClass}
                  placeholder="Enter product name..."
                />
              </label>

              <label className="block text-sm font-semibold text-[#E8E4DC]">
                Short Description <span className="text-rose-400">*</span>
                <input
                  required
                  maxLength={120}
                  value={shortDescription}
                  onChange={(event) => {
                    setShortDescription(event.target.value);
                    setSaveMessage(null);
                  }}
                  className={fieldClass}
                  placeholder="e.g., For Calmness & Mental Clarity"
                />
                <span className="mt-1 block text-right text-xs text-[#AAA8B5]">{shortDescription.length} / 120</span>
              </label>

              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_170px]">
                <label className="block text-sm font-semibold text-[#E8E4DC]">
                  Selling Price (₹) <span className="text-rose-400">*</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className={fieldClass}
                    placeholder="Enter price..."
                  />
                </label>
                <label className="block text-sm font-semibold text-[#E8E4DC]">
                  MRP (₹) <span className="text-rose-400">*</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={mrp}
                    onChange={(event) => setMrp(event.target.value)}
                    className={fieldClass}
                    placeholder="Enter MRP..."
                  />
                </label>
                <div className="flex flex-col justify-end">
                  <span className="mb-1.5 text-sm font-semibold text-[#E8E4DC]">Discount</span>
                  <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D5A328] bg-[#D5A328]/10 px-3">
                    <Tag className="h-5 w-5 shrink-0 text-[#E0AE3F]" />
                    <div className="text-center leading-tight">
                      <span className="block text-[10px] text-[#D6CEBE]">Discount</span>
                      <span className="text-base font-bold text-[#E7BD62]">{discount}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[#E8E4DC]">
                  Product Category <span className="text-rose-400">*</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as ProductCategory)}
                    className={fieldClass}
                  >
                    {CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-[#E8E4DC]">
                  Display Badge
                  <select
                    value={badge}
                    onChange={(event) => setBadge(event.target.value as ProductBadge)}
                    className={fieldClass}
                  >
                    {(['None', 'Bestseller', 'Trending', 'Recommended', 'New Arrival'] as ProductBadge[]).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#383654] bg-[#10101F] shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#383654] bg-[#1B1A34] px-5 py-3.5">
              <ImageIcon className="h-5 w-5 text-[#E0AE3F]" />
              <h2 className="font-serif text-base font-bold uppercase tracking-wide text-[#F0E8D8]">Product Image</h2>
            </div>

            <label
              className={`group relative mx-5 my-5 flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors sm:min-h-[290px] ${
                image ? 'border-[#D5A744]' : 'border-[#B0ADBF] hover:border-[#D5A744]'
              }`}
            >
              {image ? (
                <>
                  <img src={image} alt="Product image preview" className="absolute inset-0 h-full w-full object-contain p-2" />
                  <span className="absolute inset-x-0 bottom-0 bg-[#10101F]/85 px-3 py-2 text-center text-xs text-[#E8E4DC] opacity-0 transition-opacity group-hover:opacity-100">
                    Click to replace image
                  </span>
                </>
              ) : (
                <>
                  <CloudUpload className="h-11 w-11 text-[#F0EEE8]" strokeWidth={1.6} />
                  <span className="mt-4 text-base font-semibold text-[#E8E4DC]">Upload Product Image</span>
                  <span className="mt-3 text-[11px] text-[#C4C1CD]">PNG, JPG, WEBP <span className="mx-1.5">•</span> Recommended 2:3 ratio</span>
                  <span className="mt-1 text-[10px] text-[#AAA8B5]">Maximum image size: 5 MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
            {imageError && <p role="alert" className="-mt-3 px-5 pb-4 text-xs text-rose-300">{imageError}</p>}
            {image && (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="-mt-3 mb-4 ml-5 text-xs text-[#D9B764] hover:text-white"
              >
                Remove image
              </button>
            )}
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#151420] p-3">
          <div className="min-h-5 flex-1 text-xs" aria-live="polite">
            {saveMessage && (
              <span className={`inline-flex items-center gap-2 ${saveMessage.includes('successfully') ? 'text-emerald-300' : 'text-rose-300'}`}>
                {saveMessage.includes('successfully') && <CheckCircle2 className="h-4 w-4" />}
                {saveMessage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/store/add-product"
              className="rounded-xl border border-[#D5A328] px-6 py-2.5 text-sm font-semibold text-[#E9DAB9] transition-colors hover:bg-white/5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D8A83F] to-[#E8B94F] px-6 py-2.5 text-sm font-bold text-[#17120A] shadow-[0_4px_12px_rgba(191,142,42,0.2)] transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
