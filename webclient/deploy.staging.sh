# npm run build:stage
# scp -i ~/.ssh/looklookat-staging-api -r public/ looklookat-staging@40.118.188.156:/home/looklookat-staging
# ssh -i ~/.ssh/looklookat-staging-api looklookat-staging@40.118.188.156 '
# cd /var/www/html
# sudo rm -rf /var/www/html/* || true
# sudo mv /home/looklookat-staging/public/* .
# echo "successfully deployed the changes."
# exit'

echo "User info for userid: $USER"
bucketname="staging.looklook-analysis.com"
buildfolder="public/"
distributionid="E2C89WLASDGUQT"
echo "starting staging build....."
npm run build:stage
echo "Build completed....."
echo "Starting to remove objects from bucket $bucketname"
aws s3 rm --recursive s3://$bucketname 
echo "Bucket cleared " 
echo "starting to upload to s3 bucket"
aws s3 sync $buildfolder s3://$bucketname
echo "deploy completed..."

# npm run build:stage
# scp -i ~/.ssh/looklookapiv3.pem -r public/* ubuntu@3.87.209.147:~/dist
# ssh -i ~/.ssh/looklookapiv3.pem ubuntu@3.87.209.147 '
# cd /var/www/html
# sudo rm -rf /var/www/html/* || true
# sudo mv /home/ubuntu/dist/* .
# echo "successfully deployed the changes."
# exit'

