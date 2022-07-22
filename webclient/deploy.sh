# npm run build:prod
# scp -i ~/.ssh/looklookat-prod -r public/ looklookat-prod@40.112.168.91:/home/looklookat-prod
# ssh -i ~/.ssh/looklookat-prod looklookat-prod@40.112.168.91 '
# cd /var/www/html
# sudo rm -rf /var/www/html/* || true
# sudo mv /home/looklookat-prod/public/* .
# echo "successfully deployed the changes."
# exit'

bucketname="looklook-analysis.com"
buildfolder="public/"
distributionid="E3NG49RMS8QVKY"
echo "starting production build....."
npm run build:prod
echo "Build completed....."
echo "Starting to remove objects from bucket $bucketname"
aws s3 rm --recursive s3://$bucketname 
echo "Bucket cleared " 
echo "starting to upload to s3 bucket"
aws s3 sync $buildfolder s3://$bucketname
echo "deploy completed..."

# npm run build:prod
# scp -i ~/.ssh/looklookapiv3.pem -r public/* ubuntu@52.2.43.143:~/dist
# ssh -i ~/.ssh/looklookapiv3.pem ubuntu@52.2.43.143 '
# cd /var/www/html
# sudo rm -rf /var/www/html/* || true
# sudo mv /home/ubuntu/dist/* .
# echo "successfully deployed the changes."
# exit'