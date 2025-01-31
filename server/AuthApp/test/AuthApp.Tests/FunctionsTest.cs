using Amazon.Lambda.Annotations.APIGateway;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using Xunit;

namespace AuthApp.Tests;

public class FunctionTest
{
    public FunctionTest()
    {
    }

    [Fact]
    public void TestGetMethod()
    {
        var context = new TestLambdaContext();
        var functions = new Functions();

        var response = functions.Get(context);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);

        var serializationOptions = new HttpResultSerializationOptions { Format = HttpResultSerializationOptions.ProtocolFormat.RestApi };
        var apiGatewayResponse = new StreamReader(response.Serialize(serializationOptions)).ReadToEnd();
        Assert.Contains("Hello AWS Serverless", apiGatewayResponse);
    }
}
