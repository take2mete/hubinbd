export type Banner = { id?: number; slot: number; image_url: string; link_url: string; title: string; created_at?: string };
export const bannerDefaults: Banner[] = [
{slot:1,image_url:'https://rgplfsmxkarqnlwwaowd.supabase.co/storage/v1/object/public/site-assets/online-rent-a-car-bangladesh-cars-hubinbd-com-hubinbd.jpg',link_url:'https://cars.hubinbd.com/',title:'অনলাইন রেন্ট এ কার'},
{slot:2,image_url:'',link_url:'/pdf-tools',title:'PDF Tools'},
{slot:3,image_url:'',link_url:'/qr-maker',title:'QR Maker'},
{slot:4,image_url:'',link_url:'/graphics',title:'Graphics'},
{slot:5,image_url:'',link_url:'/image-tools',title:'Image Tools'},
{slot:6,image_url:'',link_url:'/hisab-khata',title:'Hisab Khata'},
{slot:7,image_url:'',link_url:'/data-maker',title:'Data Maker'}
];
