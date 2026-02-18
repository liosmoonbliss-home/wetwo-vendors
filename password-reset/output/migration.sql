-- WeTwo Password Reset Migration
-- Generated: 2026-02-18T20:32:26.155Z
-- Run this in Supabase SQL Editor

-- Step 1: Add initial_password column (safe to re-run)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS initial_password text;

-- Step 2: Update all vendor passwords + store plaintext reference
UPDATE vendors SET page_password = 'd5b21e286174ca17efc4dcda982a6029fb97e74be5a15adb3cdb82ef14c0fb03', initial_password = 'WeTwo-beautiful-moments-by-leipzib-diaz-87i8' WHERE id = '143f9714-7428-4f22-b799-842d52c153c6';
UPDATE vendors SET page_password = '92484f25c7c64cab9242d2faaccf71a051e89d08de94c4b65cef6c6e616d3687', initial_password = 'WeTwo-ep-event-group-46yx' WHERE id = '2524b332-5206-4a87-bc26-151bf43b061b';
UPDATE vendors SET page_password = '2a94dcce51dec2a84c8a13a202ce06036c6c2c6d43ae795a95ec3efa5958eddc', initial_password = 'WeTwo-elegantize-weddings-yrlq' WHERE id = '3c339aad-afe9-4c87-a611-c8dc2b4b6979';
UPDATE vendors SET page_password = '8dd20acafdeca978d5c60d79440525e8101e80e47a7beca2a6e2a9e762e46072', initial_password = 'WeTwo-ek-event-group-qi4r' WHERE id = '42a2c3f9-a73a-436b-a045-9b8f212361a3';
UPDATE vendors SET page_password = 'e69e79d9056b06b9ca15dd1c3f071c48bfe981cef20ff00a92bebd194b603316', initial_password = 'WeTwo-kenia-s-flowers-boutique-82na' WHERE id = '43193319-cfd6-4883-9824-45c94203530d';
UPDATE vendors SET page_password = '3ea49acb96edfaaf5d87dbcd3bb3af8f258d4d92784953f2a995c0b482868d91', initial_password = 'WeTwo-rebell-entertainment-tld0' WHERE id = '490ba39f-5f28-4734-ba85-5cfc4d9e14b1';
UPDATE vendors SET page_password = '56d1e23eadafcd0d1db776d518418afdec2a7349cb60c198872c11d58189989d', initial_password = 'WeTwo-threefold-cafe-16il' WHERE id = '50f6533f-4ad6-4eb5-b936-e0a57764aaf1';
UPDATE vendors SET page_password = '931ae6c3a70586550525f1b987aa6c55177476c5a3aca297c6f9e8249ad3e097', initial_password = 'WeTwo-simple-meanings-events-uis4' WHERE id = '54a1676b-395b-4659-ae36-33ac47f1f8a8';
UPDATE vendors SET page_password = '83835bc499b7f8602f8a554aa30a51b82a588e32279166bda00cfb2232aae43f', initial_password = 'WeTwo-h-h-photographers-4eyj' WHERE id = '5d9d1664-344e-4ead-9e5f-31b8cf4e2b73';
UPDATE vendors SET page_password = 'eda2c8a561608cec81e7a53209bb9eb3ec4a00f171f8dbd4dce8f737703255c5', initial_password = 'WeTwo-paul-francis-photography-lcln' WHERE id = '613c5ed9-1c2e-4873-8b9a-3c27a67385be';
UPDATE vendors SET page_password = '54c76e523b6e152709cf7d22266111b9a3a7a6fb1a65e853b62d72b7a331880f', initial_password = 'WeTwo-m-v-limousines-ltd-ivep' WHERE id = '6aabd5e0-55f7-4b6e-8512-330003edf266';
UPDATE vendors SET page_password = 'f1fbba8e8259b611c60b0ad1048d44ce8431d5b924ff8d2e805b7a2ee505c800', initial_password = 'WeTwo-hollywood-smile-photo-booth-i3yl' WHERE id = '85317459-2f13-4bc0-be54-d507c8f9e062';
UPDATE vendors SET page_password = 'd3d8de481f5ca976f8c8c2344330faeb27966a16e692c30afb4ec566dd923729', initial_password = 'WeTwo-ljdjs-event-design-entertainment-kmup' WHERE id = '8a69ac89-911f-4141-a9b1-213ad861d952';
UPDATE vendors SET page_password = '2304ef7f7fdec5d5d37d8f9fe9db47aca25560329b9adc056c06ed262228371a', initial_password = 'WeTwo-giuliana-brandon-makeup-artist-wsib' WHERE id = '8e83a714-7d92-4d0d-bf68-a733a00de360';
UPDATE vendors SET page_password = '4857adbb311415ccc7b798ba3ba49eac33d269ea55e922e493e4d266733fa63e', initial_password = 'WeTwo-fantasy-productions-0cq7' WHERE id = '96c0d998-7da7-4031-b20c-05d021c31a00';
UPDATE vendors SET page_password = 'c181a8bd96b6f34785a0ae2c1f6595b6cc0e7bc823c53040f590948ef324e109', initial_password = 'WeTwo-montclair-wedding-sanctuary-djx5' WHERE id = 'ab85cf3c-9c8d-4070-9e10-28c27aed9a8c';
UPDATE vendors SET page_password = 'c9ec4054666ad1d7fcb09c0777498693b5ab80badf7e176c243021e65594b3ac', initial_password = 'WeTwo-divine-events-creators-3h2t' WHERE id = 'b17642e6-dbae-47f7-933f-b921300b31fa';
UPDATE vendors SET page_password = '23c5c230051548f0a88d7522d5db92e7589d75c1001ba560d3e3cec0a8dcc385', initial_password = 'WeTwo-white-isle-events-ukiy' WHERE id = 'b3083ec0-4b4c-4a1c-ae8f-a511623c3505';
UPDATE vendors SET page_password = 'f4975d92207de65a569f51033f951852ecacb24d71db6947266f3bc9fa5dddf7', initial_password = 'WeTwo-mc-productions-nj-74tn' WHERE id = 'b622e34a-78f3-45cd-ab22-9abf1e62d51f';
UPDATE vendors SET page_password = 'a9aa053ab5148c362367caf5ed51644fa30638579c67abae10ed939ba8610948', initial_password = 'WeTwo-stem-productions-3h8i' WHERE id = 'c21939bb-c3bc-4f45-a4c7-f405cd83936e';
UPDATE vendors SET page_password = 'fce916fad60e7c90c3a22c0c339ed74868bbf7c39f7b840b19b87225e82dbfbd', initial_password = 'WeTwo-creative-catering-9486' WHERE id = 'c2737f6b-af37-4d14-91fa-23b58e3e9468';
UPDATE vendors SET page_password = '196b74e7f5910e440fa34c95edb97bd104b9c4d73031db75417a2eb19b173881', initial_password = 'WeTwo-selfie-booth-co-pqm9' WHERE id = 'c7796290-5c0a-4086-995b-d5af64f4c771';
UPDATE vendors SET page_password = '756eaa88ea63fb918541fd42679388aa4f1efaf8e982c71ec32721143d1d6df1', initial_password = 'WeTwo-glitter-thicket-4l7j' WHERE id = 'c89da723-d856-4e8a-b598-fc74f06989e4';
UPDATE vendors SET page_password = '7985a079b4f689440550deff1540b33be6433f4e4cf672189987ce1386ec43c6', initial_password = 'WeTwo-shaz-bridal-beauty-1eb1' WHERE id = 'cdc6c20e-f344-4d76-8d4d-ab2042fd907e';
UPDATE vendors SET page_password = 'b68b42bceadaf16f68c5261aea6129257cbf1dd5389ff3e5ae8bc7190c1a95e4', initial_password = 'WeTwo-draughtwood-mobile-bar-a9de' WHERE id = 'defb4685-93bc-44f4-a085-b42e567700cd';
UPDATE vendors SET page_password = '4c2c3fb2b7456e7bf42dedf64feee126cf3012adb224c89f566f9ad3b9d66527', initial_password = 'WeTwo-catering-by-nick-f9hg' WHERE id = 'e6d457f0-0f0c-45f7-a535-9aadb8163a93';
UPDATE vendors SET page_password = '7a45f583d7a522fc2bf39467a8eb8fc515d88857fb15cd5f7c5daaf5e375d584', initial_password = 'WeTwo-you-and-me-by-the-sea-travel-mziv' WHERE id = 'ebf0404b-2185-462c-8c2e-e72d5ffcc5d4';
UPDATE vendors SET page_password = '70b047b976124221f217890d094d16098e1f2871bc51064de6b1a85ae098d5e8', initial_password = 'WeTwo-z4-events-hlwn' WHERE id = 'fd87d4b7-2dc7-45f2-849e-8788da5f6eed';
UPDATE vendors SET page_password = '7385553d5f44161c675aa431b1eb9d6647829d3577241eba231904a956fc315c', initial_password = 'WeTwo-don-t-stop-the-music-entertainment-eau3' WHERE id = 'fe28f4a7-1879-487e-a992-de61941fb8e9';

-- Step 3: Store admin override hash for reference (use in code)
-- Admin password: 058305
-- Admin SHA-256:  a7cd53d0e143678e440485e1943e138213f2e2c8cb5dda1b82da9f786bf3cc3b
-- Add this to your Vercel env as ADMIN_PAGE_PASSWORD_HASH=a7cd53d0e143678e440485e1943e138213f2e2c8cb5dda1b82da9f786bf3cc3b
